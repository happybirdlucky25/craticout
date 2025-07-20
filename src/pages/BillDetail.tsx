import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp,
  FileText,
  Clock,
  Building,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useBillData, useVoteBreakdown, type Rollcall, type Vote } from '@/hooks/useBillData';
import { useBillAnalysisRealtime } from '@/hooks/useBillAnalysisRealtime';
import { formatBillNumber } from '@/utils/billNumberFormatter';
import { toast } from 'sonner';
import { TrackButton } from '@/components/bills/TrackButton';

const FULL_TEXT_PREVIEW_LENGTH = 1200;

const BillDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [expandedVotes, setExpandedVotes] = useState<Record<string, boolean>>({});

  const { 
    bill, 
    history, 
    amendments, 
    rollcalls, 
    sponsors, 
    loading, 
    error 
  } = useBillData(id || '');

  const analysisManager = useBillAnalysisRealtime(id || '', bill?.last_action_date || null);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleVote = (rollCallId: string) => {
    setExpandedVotes(prev => ({ ...prev, [rollCallId]: !prev[rollCallId] }));
  };

  // Navigate back with session storage support
  const handleBackClick = () => {
    const lastSearchState = sessionStorage.getItem('lastSearchState');
    if (lastSearchState) {
      navigate(`/search${lastSearchState}`);
      sessionStorage.removeItem('lastSearchState');
    } else {
      navigate(-1);
    }
  };

  // Process key dates from history
  const keyDates = useMemo(() => {
    if (!history.length || !bill) return [];

    const dates = [];
    
    // Introduced date
    const introducedDate = bill.status_date || history[0]?.date;
    if (introducedDate) {
      dates.push({
        label: 'Introduced',
        date: introducedDate,
        action: 'Bill introduced'
      });
    }

    // Last action
    if (bill.last_action_date && bill.last_action) {
      dates.push({
        label: 'Last Action',
        date: bill.last_action_date,
        action: bill.last_action
      });
    }

    // Milestones from history
    const milestoneActions = ['passed', 'referred', 'assigned', 'adopted', 'enrolled'];
    const milestones = history
      .filter(entry => 
        milestoneActions.some(action => 
          entry.action.toLowerCase().includes(action)
        )
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    milestones.forEach(milestone => {
      dates.push({
        label: milestone.action.split(' ')[0],
        date: milestone.date,
        action: milestone.action
      });
    });

    return dates.slice(0, 5); // Limit to 5 key dates
  }, [history, bill]);

  // Process committees from history
  const committees = useMemo(() => {
    const committeeSet = new Set<string>();
    
    // Primary committee
    if (bill?.committee) {
      committeeSet.add(bill.committee);
    }

    // Additional committees from history
    history.forEach(entry => {
      const action = entry.action.toLowerCase();
      if (action.includes('committee')) {
        // Extract committee name from action text
        const match = action.match(/committee[:\s]+([^;,]+)/i);
        if (match) {
          const committeeName = match[1].trim();
          if (committeeName.length > 3) { // Filter out very short matches
            committeeSet.add(committeeName);
          }
        }
      }
    });

    return Array.from(committeeSet).slice(0, 3); // Limit to 3 committees
  }, [bill, history]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 30) return `${diffDays}d ago`;
      return formatDate(dateString);
    } catch {
      return formatDate(dateString);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-3/4" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={handleBackClick}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Error Loading Bill</h3>
          <p className="text-muted-foreground mb-4">{error || 'Bill not found'}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={handleBackClick}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Bill Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm">
              {formatBillNumber(bill.bill_number)}
            </Badge>
            {bill.status_desc && (
              <Badge className="text-sm">
                {bill.status_desc}
              </Badge>
            )}
            {bill.last_action_date && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(bill.last_action_date)}
              </span>
            )}
          </div>
          <TrackButton 
            billId={bill.bill_id}
            billTitle={bill.title}
            billNumber={formatBillNumber(bill.bill_number)}
          />
        </div>
        <h1 className="text-3xl font-bold mb-4">{bill.title}</h1>
        {bill.description && (
          <p className="text-lg text-muted-foreground">{bill.description}</p>
        )}
      </div>

      {/* Key Dates and Committees Panels */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Key Dates Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Key Dates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {keyDates.map((date, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{date.label}</p>
                    <p className="text-sm text-muted-foreground truncate">{date.action}</p>
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap ml-2">
                    {formatDate(date.date)}
                  </span>
                </div>
              ))}
              {keyDates.length === 0 && (
                <p className="text-sm text-muted-foreground">No key dates available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Committees Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Committees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {committees.map((committee, index) => (
                <div key={index} className="p-2 bg-muted rounded">
                  <p className="text-sm font-medium">{committee}</p>
                </div>
              ))}
              {committees.length === 0 && (
                <p className="text-sm text-muted-foreground">No committee information available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sponsors */}
      {sponsors.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Sponsors & Co-Sponsors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sponsors.map((sponsor) => (
                <Link
                  key={sponsor.sponsor_id}
                  to={`/legislators/${sponsor.people_id}`}
                  className="p-3 border rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{sponsor.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {sponsor.party && (
                          <Badge variant="outline" className="text-xs">
                            {sponsor.party}
                          </Badge>
                        )}
                        {sponsor.district && <span>District {sponsor.district}</span>}
                      </div>
                      {sponsor.position && (
                        <p className="text-xs text-muted-foreground capitalize">{sponsor.position}</p>
                      )}
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Text Section */}
      {(bill.full_bill_text || bill.state_link) && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Full Text
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bill.full_bill_text ? (
              <Collapsible
                open={expandedSections.fullText}
                onOpenChange={() => toggleSection('fullText')}
              >
                <div className="space-y-4">
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap text-sm">
                      {expandedSections.fullText 
                        ? bill.full_bill_text 
                        : `${bill.full_bill_text.substring(0, FULL_TEXT_PREVIEW_LENGTH)}${bill.full_bill_text.length > FULL_TEXT_PREVIEW_LENGTH ? '...' : ''}`
                      }
                    </p>
                  </div>
                  {bill.full_bill_text.length > FULL_TEXT_PREVIEW_LENGTH && (
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" size="sm">
                        {expandedSections.fullText ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-2" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-2" />
                            Show More
                          </>
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  )}
                </div>
              </Collapsible>
            ) : bill.state_link ? (
              <Button asChild variant="outline">
                <a href={bill.state_link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Official Text
                </a>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Legislative History */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Legislative History</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <Collapsible
              open={expandedSections.history || history.length <= 5}
              onOpenChange={() => toggleSection('history')}
            >
              <div className="space-y-3">
                <CollapsibleContent>
                  <div className="space-y-3">
                    {(expandedSections.history ? history : history.slice(0, 5)).map((entry) => (
                      <div key={entry.history_id} className="flex gap-4 p-3 border rounded">
                        <div className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(entry.date)}
                        </div>
                        <div className="flex-1">
                          {entry.chamber && (
                            <Badge variant="outline" className="text-xs mb-1">
                              {entry.chamber}
                            </Badge>
                          )}
                          <p className="text-sm">{entry.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
                {history.length > 5 && (
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm">
                      {expandedSections.history ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-2" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          Show All ({history.length} entries)
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                )}
              </div>
            </Collapsible>
          ) : (
            <p className="text-sm text-muted-foreground">No legislative history available</p>
          )}
        </CardContent>
      </Card>

      {/* Amendments */}
      {amendments.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Amendments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {amendments.map((amendment) => (
                <div key={amendment.document_id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">
                      {amendment.document_desc || 'Amended Bill'}
                    </p>
                    {amendment.document_type && (
                      <p className="text-sm text-muted-foreground">{amendment.document_type}</p>
                    )}
                  </div>
                  {amendment.state_link && (
                    <Button asChild variant="outline" size="sm">
                      <a href={amendment.state_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Votes */}
      <VotesSection 
        rollcalls={rollcalls} 
        expandedVotes={expandedVotes}
        toggleVote={toggleVote}
        formatDate={formatDate}
      />

      {/* External Links */}
      {bill.state_link && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>External Links</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <a href={bill.state_link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Official Bill Page
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Bill Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Bill Analysis</span>
            {analysisManager.statusBadge && (
              <Badge variant={analysisManager.statusBadge.variant}>
                {analysisManager.statusBadge.text}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={analysisManager.startAnalysis}
              disabled={analysisManager.isButtonDisabled}
              className="w-full sm:w-auto"
            >
              {analysisManager.state === 'RUNNING' && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {analysisManager.buttonText}
            </Button>

            {analysisManager.error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                {analysisManager.error}
              </div>
            )}

            {analysisManager.state === 'RUNNING' && !analysisManager.analysis && (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            )}

            {analysisManager.analysis && (
              <div className="prose max-w-none">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDate(analysisManager.analysis.created_at)} • {formatRelativeTime(analysisManager.analysis.created_at)}
                  </span>
                </div>
                <div className="whitespace-pre-wrap">
                  {analysisManager.analysis.content || 'Analysis content not available.'}
                </div>
                {analysisManager.analysis.tags && analysisManager.analysis.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {analysisManager.analysis.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Separate component for votes section to manage vote breakdown state
const VotesSection = ({ 
  rollcalls, 
  expandedVotes, 
  toggleVote, 
  formatDate 
}: {
  rollcalls: Rollcall[];
  expandedVotes: Record<string, boolean>;
  toggleVote: (rollCallId: string) => void;
  formatDate: (date: string) => string;
}) => {
  if (rollcalls.length === 0) return null;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Votes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rollcalls.map((rollcall) => (
            <VoteBreakdown
              key={rollcall.roll_call_id}
              rollcall={rollcall}
              isExpanded={expandedVotes[rollcall.roll_call_id]}
              onToggle={() => toggleVote(rollcall.roll_call_id)}
              formatDate={formatDate}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Component for individual vote breakdown
const VoteBreakdown = ({ 
  rollcall, 
  isExpanded, 
  onToggle, 
  formatDate 
}: {
  rollcall: Rollcall;
  isExpanded: boolean;
  onToggle: () => void;
  formatDate: (date: string) => string;
}) => {
  const { votes, loading, error, fetchVotes } = useVoteBreakdown(rollcall.roll_call_id);

  const handleToggle = () => {
    if (!isExpanded && votes.length === 0) {
      fetchVotes();
    }
    onToggle();
  };

  const getVoteColor = (vote: string) => {
    switch (vote?.toLowerCase()) {
      case 'yea':
      case 'yes': return 'text-green-600';
      case 'nay':
      case 'no': return 'text-red-600';
      case 'nv':
      case 'not voting': return 'text-yellow-600';
      case 'absent': return 'text-gray-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="border rounded p-4">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={handleToggle}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm text-muted-foreground">
              {formatDate(rollcall.date)}
            </span>
            {rollcall.chamber && (
              <Badge variant="outline" className="text-xs">
                {rollcall.chamber}
              </Badge>
            )}
          </div>
          <p className="font-medium">{rollcall.description}</p>
          <div className="flex gap-4 text-sm text-muted-foreground mt-2">
            {rollcall.yea !== undefined && <span>Yea: {rollcall.yea}</span>}
            {rollcall.nay !== undefined && <span>Nay: {rollcall.nay}</span>}
            {rollcall.nv !== undefined && <span>Not Voting: {rollcall.nv}</span>}
            {rollcall.absent !== undefined && <span>Absent: {rollcall.absent}</span>}
            {rollcall.total !== undefined && <span>Total: {rollcall.total}</span>}
          </div>
        </div>
        <Button variant="ghost" size="sm">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">Failed to load vote breakdown</p>
          ) : votes.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {votes.map((vote) => (
                <div key={vote.vote_id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <Link
                      to={`/legislators/${vote.people_id}`}
                      className="font-medium hover:underline"
                    >
                      {vote.name}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {vote.party && (
                        <Badge variant="outline" className="text-xs">
                          {vote.party}
                        </Badge>
                      )}
                      {vote.district && <span>District {vote.district}</span>}
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${getVoteColor(vote.vote || '')}`}>
                    {vote.vote || 'Unknown'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No vote breakdown available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BillDetail;