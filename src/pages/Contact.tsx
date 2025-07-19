import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { CheckCircle } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
    dataRequest: false
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isFormValid = () => {
    return formData.fullName.trim() !== "" && 
           formData.email.trim() !== "" && 
           formData.subject !== "" && 
           formData.message.trim() !== "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      // Simulate form submission
      setShowSuccessModal(true);
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        subject: "",
        message: "",
        dataRequest: false
      });
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <a href="/" className="hover:text-gray-700">Dashboard</a>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-gray-900">Contact Us</span>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Contact Us</h1>

        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select onValueChange={(value) => handleInputChange("subject", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Inquiry</SelectItem>
                  <SelectItem value="technical">Technical Support</SelectItem>
                  <SelectItem value="billing">Billing Question</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="partnership">Partnership Opportunity</SelectItem>
                  <SelectItem value="press">Press Inquiry</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                placeholder="Please describe your inquiry in detail..."
                rows={6}
                required
              />
            </div>

            {/* Data Request Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dataRequest"
                checked={formData.dataRequest}
                onCheckedChange={(checked) => handleInputChange("dataRequest", checked as boolean)}
              />
              <Label htmlFor="dataRequest" className="text-sm text-gray-600">
                Request data export or deletion
              </Label>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full"
                disabled={!isFormValid()}
              >
                Send Message
              </Button>
            </div>
          </form>
        </div>

        {/* Contact Information */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Get in Touch</h2>
          <div className="space-y-3 text-gray-600">
            <p>
              Have questions about ShadowCongress? We're here to help. Send us a message using the form above and we'll get back to you as soon as possible.
            </p>
            <p>
              For urgent technical issues, please include as much detail as possible about the problem you're experiencing.
            </p>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <DialogTitle>Message Sent Successfully!</DialogTitle>
            </div>
            <DialogDescription>
              Thank you for contacting us. We've received your message and will respond within 24 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowSuccessModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contact;