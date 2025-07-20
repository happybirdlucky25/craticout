# n8n Workflow for Bill Analysis Generation

## Workflow Overview
This n8n workflow receives webhook triggers for bill analysis requests, fetches bill data from Supabase, generates AI analysis, and stores the results back to the database.

## Workflow Nodes

### 1. HTTP Trigger Node
- **Type**: Webhook trigger
- **Method**: POST
- **Authentication**: Optional API key or IP whitelist
- **Expected Payload**:
  ```json
  {
    "bill_id": "string",
    "bill_number": "string", 
    "timestamp": "ISO 8601 string"
  }
  ```

### 2. Input Validation Node
- **Type**: Code (JavaScript)
- **Purpose**: Validate incoming webhook payload
- **Logic**:
  ```javascript
  // Validate required fields
  if (!$json.bill_id || !$json.bill_number) {
    throw new Error('Missing required fields: bill_id, bill_number');
  }
  
  // Return validated data
  return {
    bill_id: $json.bill_id,
    bill_number: $json.bill_number,
    started_at: new Date().toISOString()
  };
  ```

### 3. Fetch Bill Data Node
- **Type**: Supabase (or HTTP Request)
- **Purpose**: Fetch comprehensive bill data
- **Query**: 
  ```sql
  SELECT 
    b.*,
    array_agg(DISTINCT h.*) as history,
    array_agg(DISTINCT s.* || p.*) as sponsors,
    array_agg(DISTINCT d.*) as amendments,
    array_agg(DISTINCT r.*) as rollcalls
  FROM bills b
  LEFT JOIN history h ON h.bill_id = b.bill_id
  LEFT JOIN sponsor s ON s.bill_id = b.bill_id
  LEFT JOIN people p ON p.people_id = s.people_id
  LEFT JOIN documents_leg d ON d.bill_id = b.bill_id 
    AND (lower(d.document_type) LIKE '%amend%' OR lower(d.document_desc) LIKE '%amend%')
  LEFT JOIN rollcall r ON r.bill_id = b.bill_id
  WHERE b.bill_id = $1
  GROUP BY b.bill_id
  ```

### 4. Data Preparation Node
- **Type**: Code (JavaScript)
- **Purpose**: Format bill data for AI analysis
- **Logic**:
  ```javascript
  const billData = $json;
  
  // Format bill information for AI prompt
  const prompt = `
  Analyze the following legislative bill:
  
  Bill: ${billData.bill_number}
  Title: ${billData.title}
  Status: ${billData.status_desc}
  Description: ${billData.description}
  
  Committee: ${billData.committee}
  Last Action: ${billData.last_action} (${billData.last_action_date})
  
  Sponsors: ${billData.sponsors?.map(s => `${s.name} (${s.party})`).join(', ')}
  
  Legislative History:
  ${billData.history?.map(h => `${h.date}: ${h.action}`).join('\n')}
  
  ${billData.full_bill_text ? `Full Text (excerpt): ${billData.full_bill_text.substring(0, 2000)}...` : ''}
  
  Please provide a comprehensive analysis including:
  1. Summary of the bill's purpose and key provisions
  2. Potential impact and implications
  3. Political context and likely outcomes
  4. Key stakeholders and interest groups affected
  5. Timeline and next steps in the legislative process
  
  Format the response in clear, well-structured paragraphs.
  `;
  
  return {
    bill_id: billData.bill_id,
    bill_number: billData.bill_number,
    prompt: prompt,
    bill_data: billData
  };
  ```

### 5. AI Analysis Node
- **Type**: OpenAI (or similar AI service)
- **Purpose**: Generate bill analysis using AI
- **Configuration**:
  - Model: GPT-4 or Claude
  - Max tokens: 2000-4000
  - Temperature: 0.3 (for more consistent analysis)
  - System prompt: "You are a legislative analyst providing objective, comprehensive analysis of bills and legislation."

### 6. Extract Tags Node
- **Type**: Code (JavaScript)  
- **Purpose**: Extract relevant tags from the analysis
- **Logic**:
  ```javascript
  const analysis = $json.choices[0].message.content;
  const billData = $('Data Preparation').item.json.bill_data;
  
  // Extract potential tags
  const tags = [];
  
  // Add tags based on bill content
  if (analysis.toLowerCase().includes('budget') || analysis.toLowerCase().includes('fiscal')) {
    tags.push('fiscal-impact');
  }
  if (analysis.toLowerCase().includes('environment')) {
    tags.push('environment');
  }
  if (analysis.toLowerCase().includes('healthcare')) {
    tags.push('healthcare');
  }
  if (analysis.toLowerCase().includes('education')) {
    tags.push('education');
  }
  if (analysis.toLowerCase().includes('defense') || analysis.toLowerCase().includes('military')) {
    tags.push('defense');
  }
  
  // Add committee-based tags
  if (billData.committee) {
    if (billData.committee.toLowerCase().includes('judiciary')) {
      tags.push('judiciary');
    }
    if (billData.committee.toLowerCase().includes('appropriations')) {
      tags.push('appropriations');
    }
  }
  
  return {
    bill_id: billData.bill_id,
    bill_number: billData.bill_number,
    analysis: analysis,
    tags: [...new Set(tags)] // Remove duplicates
  };
  ```

### 7. Store Analysis Node
- **Type**: Supabase (or HTTP Request)
- **Purpose**: Insert analysis into simple_bill_analysis table
- **Configuration**:
  - Table: simple_bill_analysis
  - Operation: INSERT
  - Data mapping:
    ```json
    {
      "bill_id": "={{$json.bill_id}}",
      "bill_number": "={{$json.bill_number}}",
      "analysis_type": "comprehensive",
      "content": "={{$json.analysis}}",
      "tags": "={{$json.tags}}",
      "created_at": "={{new Date().toISOString()}}"
    }
    ```

### 8. Success Response Node
- **Type**: Respond to Webhook
- **Purpose**: Send success confirmation
- **Response**:
  ```json
  {
    "status": "success",
    "bill_id": "={{$('Extract Tags').item.json.bill_id}}",
    "analysis_id": "={{$('Store Analysis').item.json.id}}",
    "completed_at": "={{new Date().toISOString()}}"
  }
  ```

### 9. Error Handler Node
- **Type**: Code (JavaScript)
- **Purpose**: Handle errors and log failures
- **Logic**:
  ```javascript
  const error = $json.error || 'Unknown error';
  const billId = $('Input Validation').item?.json?.bill_id || 'unknown';
  
  console.error('Bill analysis failed:', {
    bill_id: billId,
    error: error,
    timestamp: new Date().toISOString()
  });
  
  // Optionally store error in database or send notification
  
  return {
    status: 'error',
    bill_id: billId,
    error: error.message || error,
    failed_at: new Date().toISOString()
  };
  ```

## Workflow Configuration

### Environment Variables
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for database operations
- `OPENAI_API_KEY`: OpenAI API key for AI analysis
- `N8N_WEBHOOK_SECRET`: Optional secret for webhook authentication

### Error Handling
- Add error handling nodes after each major operation
- Implement retry logic for transient failures
- Log errors to monitoring system
- Send notifications for critical failures

### Performance Considerations
- Set reasonable timeouts (5-10 minutes max)
- Implement queue management for high-volume requests
- Consider rate limiting to avoid API quota issues
- Monitor execution time and optimize slow operations

### Security
- Validate all input data
- Use environment variables for sensitive configuration
- Implement webhook authentication
- Audit log all analysis generation requests

## Deployment Notes
1. Import workflow JSON into n8n instance
2. Configure environment variables
3. Test with sample bill data
4. Set up monitoring and alerting
5. Configure webhook URL in Edge Function environment