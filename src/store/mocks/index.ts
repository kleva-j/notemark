import type { NoteInfo } from "@/models";

import { genDateFromRange } from "@/lib/utils";

export const MockNotes: NoteInfo[] = [
  {
    id: "1",
    title: "Meeting Tomorrow",
    content: `Hi team,

Just a reminder about our meeting tomorrow at 10 AM. Please come prepared with your project updates.

Agenda:
- Project status updates
- Timeline review
- Next steps discussion
- Q&A session

Please bring:
- Updated project timelines
- Any blockers or challenges
- Questions for the team

Looking forward to seeing everyone there!

Best regards,
Team Lead`,
    description:
      "Hi team, just a reminder about our meeting tomorrow at 10 AM.\nPlease come prepared with your project updates.",
  },
  {
    id: "2",
    title: "Weekend Plans",
    content: `Hey everyone!

I'm thinking of organizing a team outing this weekend. Would you be interested in a hiking trip or a beach day?

Options:
1. Hiking Trip
   - Location: Mount Tamalpais
   - Difficulty: Moderate
   - Duration: 4-5 hours
   - Beautiful views and fresh air

2. Beach Day
   - Location: Stinson Beach
   - Activities: Swimming, volleyball, BBQ
   - Duration: All day
   - Relaxing and fun

Please let me know your preference by Wednesday so I can make the necessary arrangements. Also, let me know if you have any dietary restrictions for the BBQ.

Looking forward to spending time with the team outside of work!

Cheers,
Team Organizer`,
    description:
      "Hey everyone! I'm thinking of organizing a team outing this weekend.\nWould you be interested in a hiking trip or a beach day?",
  },
  {
    id: "3",
    title: "Vacation Itinerary",
    content: `Vacation Planning - Two Week Trip

Just a heads up that I'll be taking a two-week vacation next month. I'll make sure all my projects are up to date before I leave.

Dates: July 15-29, 2024

Destination: Europe
- Week 1: Paris, France
- Week 2: Rome, Italy

Before I leave:
- Complete all pending tasks
- Hand over responsibilities to backup
- Set up out-of-office messages
- Provide contact information for emergencies

During my absence:
- Backup contact: [Backup Person Name]
- Emergency contact: [Emergency Contact]
- I'll check emails occasionally but response may be delayed

I'll be back refreshed and ready to tackle new challenges!

Best regards,
Vacation Planner`,
    description:
      "Just a heads up that I'll be taking a two-week vacation next month.\nI'll make sure all my projects are up to date before I leave.",
  },
  {
    id: "4",
    title: "New Project Idea",
    content: `Project Concept: AI-Powered Task Management System

I've been brainstorming and came up with an interesting project concept. Do you have time this week to discuss its potential impact and feasibility?

Concept Overview:
- AI-powered task prioritization
- Smart scheduling based on productivity patterns
- Integration with existing tools
- Predictive analytics for project completion

Key Features:
1. Intelligent Task Sorting
2. Automated Time Estimation
3. Progress Tracking
4. Team Collaboration Tools
5. Performance Analytics

Potential Benefits:
- 30% increase in productivity
- Better resource allocation
- Reduced project delays
- Improved team satisfaction

Technical Requirements:
- Machine learning algorithms
- Real-time data processing
- Secure cloud infrastructure
- Mobile app development

Let's schedule a meeting to discuss this in detail and explore the possibilities!

Best regards,
Innovation Team`,
    description:
      "I've been brainstorming and came up with an interesting project concept.\nDo you have time this week to discuss its potential impact and feasibility?",
  },
  {
    id: "5",
    title: "Feedback on Proposal",
    content: `Proposal Review Feedback

Thank you for sending over the proposal. I've reviewed it and have some thoughts. Could we schedule a meeting to discuss my feedback in detail?

Overall Assessment: Good foundation, needs refinement

Strengths:
- Clear project objectives
- Well-defined scope
- Realistic timeline
- Good team composition

Areas for Improvement:
1. Budget allocation needs adjustment
2. Risk assessment could be more comprehensive
3. Success metrics need clarification
4. Stakeholder communication plan

Specific Feedback:
- Section 3.2: Add more detail on implementation strategy
- Section 4.1: Include contingency plans
- Section 5.3: Define KPIs more clearly
- Appendix A: Add supporting documentation

Next Steps:
- Schedule review meeting
- Address feedback points
- Revise proposal
- Final approval process

Looking forward to our discussion!

Best regards,
Reviewer`,
    description:
      "Thank you for sending over the proposal. I've reviewed it and have some thoughts.\nCould we schedule a meeting to discuss my feedback in detail?",
  },
  {
    id: "6",
    title: "Conference Registration",
    content: `Tech Conference Registration Complete

I've completed the registration for the upcoming tech conference. Let me know if you need any additional information from my end.

Conference Details:
- Name: TechCrunch Disrupt 2024
- Date: September 15-17, 2024
- Location: San Francisco, CA
- Venue: Moscone Center

Registration Confirmation:
- Confirmation #: TC2024-12345
- Attendee: [Your Name]
- Company: [Company Name]
- Ticket Type: Full Conference Pass

What's Included:
- Access to all sessions
- Networking events
- Exhibition hall access
- Conference materials
- Lunch and refreshments

Schedule Highlights:
- Day 1: Keynotes and main sessions
- Day 2: Workshops and panels
- Day 3: Networking and closing

Please let me know if you need any additional information or have specific sessions you'd like me to attend.

Best regards,
Conference Attendee`,
    description:
      "I've completed the registration for the upcoming tech conference.\nLet me know if you need any additional information from my end.",
  },
  {
    id: "7",
    title: "Team Dinner",
    content: `Team Dinner Celebration

To celebrate our recent project success, I'd like to organize a team dinner. Are you available next Friday evening? Please let me know your preferences.

Event Details:
- Date: Friday, June 28, 2024
- Time: 7:00 PM
- Occasion: Project Success Celebration
- Dress Code: Business Casual

Restaurant Options:
1. The Grand Bistro (Upscale French)
2. Ocean View Grill (Seafood)
3. Urban Kitchen (Modern American)
4. Spice Garden (Indian Fusion)

Menu Preferences:
- Vegetarian options available
- Gluten-free accommodations
- Dietary restrictions will be accommodated

Activities:
- Dinner and drinks
- Team recognition
- Project highlights
- Future planning discussion

Please RSVP by Wednesday with:
- Your attendance confirmation
- Restaurant preference
- Any dietary restrictions
- Plus one information (if applicable)

Looking forward to celebrating our success together!

Best regards,
Event Organizer`,
    description:
      "To celebrate our recent project success, I'd like to organize a team dinner.\nAre you available next Friday evening? Please let me know your preferences.",
  },
  {
    id: "8",
    title: "Important Announcement",
    content: `All-Hands Meeting Announcement

Please join us for an all-hands meeting this Friday at 3 PM. We have some exciting news to share about the company's future.

Meeting Details:
- Date: Friday, June 21, 2024
- Time: 3:00 PM - 4:30 PM
- Location: Main Conference Room
- Virtual Option: Zoom link will be provided

Agenda:
1. Company Performance Update
2. Strategic Initiatives
3. New Product Announcements
4. Team Recognition
5. Q&A Session

Important Topics:
- Q4 financial results
- New market expansion
- Product roadmap updates
- Organizational changes
- Employee benefits updates

Preparation:
- Review recent company updates
- Prepare questions
- Bring positive energy

This is a mandatory meeting for all employees. Please mark your calendars and plan to attend.

We're excited to share some great news with everyone!

Best regards,
Executive Team`,
    description:
      "Please join us for an all-hands meeting this Friday at 3 PM.\nWe have some exciting news to share about the company's future.",
  },
  {
    id: "9",
    title: "Project Update",
    content: `Project Status Update

Thanks for the update. The progress looks great so far. Let's schedule a call to discuss the next steps.

Current Status:
- Phase 1: 95% Complete
- Phase 2: 60% Complete
- Phase 3: 25% Complete
- Overall Progress: 65%

Key Achievements:
- Successfully launched beta version
- User feedback has been positive
- Performance metrics exceeded expectations
- Team collaboration is excellent

Challenges:
- Minor technical issues in Phase 2
- Resource allocation needs adjustment
- Timeline may need slight extension

Next Steps:
1. Complete Phase 1 final testing
2. Address Phase 2 challenges
3. Begin Phase 3 planning
4. Schedule stakeholder review

Action Items:
- Technical team to resolve Phase 2 issues
- Project manager to update timeline
- Marketing team to prepare launch materials
- QA team to complete testing

Let's schedule a call this week to discuss these items in detail.

Best regards,
Project Manager`,
    description:
      "Thanks for the update. The progress looks great so far.\nLet's schedule a call to discuss the next steps.",
  },
  {
    id: "10",
    title: "Question about Budget",
    content: `Budget Review and Questions

I've reviewed the budget numbers you sent over. Can we set up a quick call to discuss some potential adjustments?

Budget Analysis:
- Total Budget: $500,000
- Current Spending: $320,000
- Remaining: $180,000
- Timeline: 6 months remaining

Areas of Concern:
1. Marketing budget is 20% over allocated
2. Development costs are under budget
3. Travel expenses need clarification
4. Equipment costs seem high

Questions:
- Can we reallocate marketing funds to development?
- What's the justification for travel expenses?
- Are there opportunities for cost savings?
- Should we adjust the timeline?

Proposed Adjustments:
- Reduce marketing budget by 15%
- Increase development budget by 10%
- Review travel policy
- Optimize equipment purchases

Let's discuss these adjustments and find the best solution for the project.

Best regards,
Finance Team`,
    description:
      "I've reviewed the budget numbers you sent over.\nCan we set up a quick call to discuss some potential adjustments?",
  },
  {
    id: "11",
    title: "Marketing Strategy",
    content: `Marketing Strategy for New Product Launch

I've been working on the marketing strategy for the new product. Can we schedule a meeting to discuss the details?

Strategy Overview:
- Target Audience: Tech-savvy professionals
- Market Size: $2.5 billion
- Competitive Advantage: AI-powered features
- Launch Timeline: Q3 2024

Marketing Channels:
1. Digital Marketing
   - Social media campaigns
   - Content marketing
   - Email marketing
   - PPC advertising

2. Traditional Marketing
   - Industry publications
   - Trade shows
   - PR campaigns
   - Partnership marketing

3. Influencer Marketing
   - Tech influencers
   - Industry experts
   - Customer testimonials
   - Case studies

Budget Allocation:
- Digital: 60%
- Traditional: 25%
- Influencer: 15%

Success Metrics:
- Brand awareness: 40% increase
- Lead generation: 200% growth
- Conversion rate: 15% target
- ROI: 300% expected

Let's meet to finalize this strategy and begin implementation.

Best regards,
Marketing Team`,
    description:
      "I've been working on the marketing strategy for the new product.\nCan we schedule a meeting to discuss the details?",
  },
  {
    id: "12",
    title: "New Product Launch",
    content: `New Product Launch Planning

I've been working on the new product launch. Can we schedule a meeting to discuss the details?

Product Details:
- Name: Project Nova
- Category: Productivity Software
- Target Market: Enterprise
- Launch Date: October 15, 2024

Launch Strategy:
1. Pre-launch Phase (August-September)
   - Beta testing
   - User feedback collection
   - Marketing preparation
   - Sales training

2. Launch Phase (October)
   - Product release
   - Marketing campaigns
   - Sales activation
   - Customer support

3. Post-launch Phase (November-December)
   - Performance monitoring
   - Customer feedback
   - Iteration planning
   - Success measurement

Key Features:
- AI-powered automation
- Real-time collaboration
- Advanced analytics
- Mobile optimization
- Enterprise security

Success Metrics:
- 10,000 users in first month
- $500K revenue in Q4
- 4.5+ star rating
- 90% customer satisfaction

Let's discuss the launch plan and assign responsibilities.

Best regards,
Product Team`,
    description:
      "I've been working on the new product launch.\nCan we schedule a meeting to discuss the details?",
  },
].map((item) => {
  const createdAt = genDateFromRange();

  return {
    ...item,
    createdAt,
    updatedAt: genDateFromRange(createdAt),
  };
});
