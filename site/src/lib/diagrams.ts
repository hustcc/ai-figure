export interface DiagramExample {
  title: string;
  markdown: string;
}

export interface DiagramGroup {
  type: string;
  label: string;
  examples: DiagramExample[];
}

export const DIAGRAMS: DiagramGroup[] = [
  {
    type: 'flow',
    label: 'Flowchart',
    examples: [
      {
        title: 'CI/CD Pipeline',
        markdown: `figure flow
direction: LR
palette: antv
title: CI/CD Pipeline
code[Push Code] --> lint{Lint OK?}
lint --> test[Run Tests]: yes
lint --> fix((Fix Lint)): no
fix --> code
test --> build[Build Image]
build --> deploy[Deploy to Staging]
deploy --> review{Approved?}
review --> prod[Deploy to Prod]: yes
review --> rollback[Rollback]: no
group Pipeline: code, lint, test, build`,
      },
      {
        title: 'User Authentication',
        markdown: `figure flow
direction: LR
palette: figma
title: User Authentication
start((Start)) --> login[Enter Credentials]
login --> validate{Valid?}
validate --> mfa{MFA Enabled?}: yes
validate --> error[Show Error]: no
error --> login
mfa --> otp[Enter OTP]: yes
mfa --> dashboard((Dashboard)): no
otp --> verify{OTP Correct?}
verify --> dashboard: yes
verify --> lockout[Lock Account]: no`,
      },
      {
        title: 'Order Processing',
        markdown: `figure flow
direction: TB
palette: default
title: Order Processing
place[Place Order] --> stock{In Stock?}
stock --> payment[Process Payment]: yes
stock --> notify[Notify Customer]: no
payment --> paid{Payment OK?}
paid --> warehouse[Send to Warehouse]: yes
paid --> refund[Refund]: no
warehouse --> ship[/Ship Package/]
ship --> delivered((Delivered))`,
      },
      {
        title: 'Incident Response',
        markdown: `figure flow
direction: LR
palette: drawio
title: Incident Response
alert[Alert Fired] --> severity{Severity?}
severity --> page[Page On-Call]: P1
severity --> ticket[Create Ticket]: P2
severity --> backlog[Add to Backlog]: P3
page --> ack{Ack within 15m?}
ack --> mitigate[Mitigate]: yes
ack --> escalate[Escalate]: no
escalate --> mitigate
mitigate --> postmortem[Write Postmortem]`,
      },
      {
        title: 'Content Review',
        markdown: `figure flow
direction: TB
palette: vega
title: Content Review Flow
submit[Submit Article] --> auto{Auto-moderation}
auto --> human[Human Review]: flag
auto --> publish((Publish)): pass
human --> approve{Decision}
approve --> publish: approve
approve --> revise[Request Revision]: revise
approve --> reject[Reject]: reject
revise --> submit`,
      },
      {
        title: 'Refund Process',
        markdown: `figure flow
direction: TB
palette: mono-blue
title: Refund Request Flow
request[Customer Requests Refund] --> eligible{Eligible?}
eligible --> reason{Reason?}: yes
eligible --> deny[Deny Refund]: no
reason --> defect[Item Defective]: defect
reason --> change[Changed Mind]: changed
defect --> replace{Replace?}
replace --> ship[Ship Replacement]: yes
replace --> credit[Issue Credit]: no
change --> restock[Restock Item]
restock --> credit
credit --> notify((Notify Customer))
ship --> notify
deny --> notify`,
      },
      {
        title: 'Sales Pipeline',
        markdown: `figure flow
direction: LR
palette: mono-green
title: Sales Lead Qualification
lead[New Lead] --> score{Lead Score?}
score --> hot[Assign AE]: hot
score --> warm[Nurture Campaign]: warm
score --> cold[Newsletter]: cold
hot --> demo[Schedule Demo]
demo --> proposal[Send Proposal]
proposal --> negotiate{Negotiation}
negotiate --> won((Closed Won)): agreed
negotiate --> lost[Closed Lost]: no deal
warm --> requalify{Re-qualify?}
requalify --> hot: improved
group Pipeline: lead, score, hot, demo, proposal`,
      },
      {
        title: 'Bug Triage',
        markdown: `figure flow
direction: LR
palette: drawio
title: Bug Triage Workflow
report[Bug Reported] --> repro{Reproducible?}
repro --> severity{Severity?}: yes
repro --> close[Close: Cannot Repro]: no
severity --> critical[P0 Hotfix]: critical
severity --> high[P1 Sprint]: high
severity --> low[P2 Backlog]: low
critical --> hotfix[Hotfix Branch]
hotfix --> fix[Fix & Deploy]
high --> sprint[Add to Sprint]
low --> backlog[Add to Backlog]
fix --> verify((Verified))
sprint --> verify`,
      },
    ],
  },
  {
    type: 'tree',
    label: 'Tree',
    examples: [
      {
        title: 'Engineering Org',
        markdown: `figure tree
direction: TB
palette: antv
title: Engineering Org Chart
cto[CTO]
cto --> fe[Frontend Lead]
cto --> be[Backend Lead]
cto --> infra[Infra Lead]
fe --> fe1[Senior FE]
fe --> fe2[Mid FE]
be --> be1[Senior BE]
be --> be2[Mid BE]
infra --> sre1[SRE]
infra --> sre2[DevOps]`,
      },
      {
        title: 'Product Taxonomy',
        markdown: `figure tree
direction: LR
palette: figma
title: E-Commerce Taxonomy
root[Products]
root --> elec[Electronics]
root --> clothing[Clothing]
root --> home[Home & Garden]
elec --> phones[Phones]
elec --> laptops[Laptops]
clothing --> mens[Men]
clothing --> womens[Women]
home --> furniture[Furniture]
home --> garden[Garden]`,
      },
      {
        title: 'Tech Stack',
        markdown: `figure tree
direction: TB
palette: mono-blue
title: Full-Stack Tech Tree
stack[Tech Stack]
stack --> frontend[Frontend]
stack --> backend[Backend]
stack --> infra[Infrastructure]
frontend --> react[React]
frontend --> next[Next.js]
backend --> node[Node.js]
backend --> pg[PostgreSQL]
infra --> aws[AWS]
infra --> docker[Docker]
infra --> k8s[Kubernetes]`,
      },
      {
        title: 'Permission Tree',
        markdown: `figure tree
direction: LR
palette: mono-green
title: RBAC Permission Tree
admin[Admin]
admin --> users[User Mgmt]
admin --> content[Content Mgmt]
admin --> settings[Settings]
users --> create_user[Create User]
users --> delete_user[Delete User]
content --> publish[Publish]
content --> edit[Edit]
settings --> billing[Billing]
settings --> security[Security]`,
      },
      {
        title: 'API Routes',
        markdown: `figure tree
direction: TB
palette: vega
title: REST API Routes
api[/api]
api --> v1[/v1]
api --> v2[/v2]
v1 --> users1[/users]
v1 --> posts1[/posts]
v2 --> users2[/users]
v2 --> search[/search]
users1 --> uid[/:id]
posts1 --> pid[/:id]
search --> query[?q=]`,
      },
      {
        title: 'Marketing Channels',
        markdown: `figure tree
direction: TB
palette: antv
title: Marketing Channel Hierarchy
marketing[Marketing]
marketing --> paid[Paid]
marketing --> organic[Organic]
marketing --> partners[Partners]
paid --> search[Search Ads]
paid --> social[Social Ads]
paid --> display[Display]
organic --> seo[SEO]
organic --> content[Content Blog]
organic --> referral[Referral]
partners --> affiliate[Affiliate]
partners --> events[Events]`,
      },
      {
        title: 'Knowledge Base',
        markdown: `figure tree
direction: LR
palette: figma
title: Knowledge Base Structure
kb[Knowledge Base]
kb --> product[Product]
kb --> engineering[Engineering]
kb --> sales[Sales]
product --> specs[Specs]
product --> roadmap[Roadmap]
engineering --> runbooks[Runbooks]
engineering --> adr[Architecture Decisions]
engineering --> onboarding[Onboarding Guide]
sales --> playbook[Sales Playbook]
sales --> pricing[Pricing Guide]`,
      },
      {
        title: 'Work Breakdown',
        markdown: `figure tree
direction: TB
palette: mono-purple
title: Project Work Breakdown
project[SaaS Launch]
project --> design[Design]
project --> development[Development]
project --> launch[Launch]
design --> ux[UX Research]
design --> ui[UI Mockups]
development --> fe[Frontend]
development --> be[Backend]
development --> qa[QA & Testing]
launch --> marketing[Marketing]
launch --> support[Support Docs]`,
      },
    ],
  },
  {
    type: 'arch',
    label: 'Architecture',
    examples: [
      {
        title: 'Web Stack',
        markdown: `figure arch
direction: TB
palette: antv
title: Modern Web Stack
layer Frontend
  cdn[CDN]
  spa[React SPA]
layer API Gateway
  gateway[API Gateway]
  auth[Auth Service]
layer Backend
  api[REST API]
  worker[Background Worker]
layer Data
  pg[PostgreSQL]
  redis[Redis Cache]
  s3[Object Storage]`,
      },
      {
        title: 'Microservices',
        markdown: `figure arch
direction: TB
palette: figma
title: Microservices Architecture
layer Client
  web[Web App]
  mobile[Mobile App]
layer Gateway
  lb[Load Balancer]
  apigw[API Gateway]
layer Services
  user_svc[User Service]
  order_svc[Order Service]
  notify_svc[Notification Service]
layer Storage
  user_db[User DB]
  order_db[Order DB]
  queue[Message Queue]`,
      },
      {
        title: 'Data Pipeline',
        markdown: `figure arch
direction: LR
palette: mono-blue
title: Data Pipeline
layer Ingestion
  kafka[Kafka]
  firehose[Kinesis]
layer Processing
  spark[Spark]
  flink[Flink]
layer Storage
  lake[Data Lake]
  warehouse[Data Warehouse]
layer Serving
  api[Query API]
  bi[BI Dashboard]`,
      },
      {
        title: 'CI/CD Infra',
        markdown: `figure arch
direction: TB
palette: drawio
title: CI/CD Infrastructure
layer Source
  github[GitHub]
  registry[Container Registry]
layer Build
  actions[GitHub Actions]
  sonar[SonarQube]
layer Environments
  staging[Staging Cluster]
  prod[Production Cluster]
layer Observability
  grafana[Grafana]
  loki[Loki]
  tempo[Tempo]`,
      },
      {
        title: 'ML Platform',
        markdown: `figure arch
direction: TB
palette: vega
title: ML Platform
layer Data
  lake[Feature Store]
  stream[Event Stream]
layer Training
  notebook[Jupyter]
  trainer[Training Jobs]
layer Registry
  mlflow[MLflow]
  store[Model Store]
layer Serving
  endpoint[Inference API]
  monitor[Drift Monitor]`,
      },
      {
        title: 'Event-Driven',
        markdown: `figure arch
direction: TB
palette: mono-orange
title: Event-Driven Architecture
layer Producers
  web[Web App]
  mobile[Mobile App]
  iot[IoT Devices]
layer Broker
  kafka[Kafka Topics]
  schema[Schema Registry]
layer Consumers
  order_svc[Order Service]
  notify_svc[Notification Service]
  analytics[Analytics Engine]
layer Storage
  events[Event Store]
  reports[Report DB]`,
      },
      {
        title: 'Mobile Backend',
        markdown: `figure arch
direction: TB
palette: figma
title: Mobile App Backend
layer Mobile
  ios[iOS App]
  android[Android App]
layer Edge
  cdn[CDN]
  apigw[API Gateway]
layer Services
  auth[Auth Service]
  push[Push Notifications]
  media[Media Service]
layer Data
  postgres[PostgreSQL]
  redis[Redis]
  s3[S3 Storage]`,
      },
      {
        title: 'SaaS Platform',
        markdown: `figure arch
direction: LR
palette: drawio
title: SaaS Platform Layers
layer Client
  webapp[React App]
  mobile[React Native]
layer Platform
  gateway[API Gateway]
  auth[Auth & Billing]
  core[Core Services]
layer Data
  pg[PostgreSQL]
  elastic[Elasticsearch]
  queue[SQS Queue]
layer Ops
  ci[CI/CD]
  monitoring[Monitoring]`,
      },
    ],
  },
  {
    type: 'sequence',
    label: 'Sequence',
    examples: [
      {
        title: 'OAuth2 Login',
        markdown: `figure sequence
title: OAuth2 Login Flow
actors: Browser, App, AuthServer, DB
Browser -> App: GET /login
App -> AuthServer: Redirect /authorize
AuthServer --> Browser: Login Page
Browser -> AuthServer: POST credentials
AuthServer -> DB: Verify user
DB --> AuthServer: User record
AuthServer --> Browser: Auth code
Browser -> App: GET /callback?code=xxx
App -> AuthServer: POST /token
AuthServer --> App: access_token
App --> Browser: Set session cookie`,
      },
      {
        title: 'API Request',
        markdown: `figure sequence
title: API Request Lifecycle
actors: Client, Gateway, Service, Cache, DB
Client -> Gateway: POST /api/orders
Gateway -> Service: Forward + JWT
Service -> Cache: GET cart:user123
Cache --> Service: Cache miss
Service -> DB: SELECT cart
DB --> Service: Cart items
Service -> DB: INSERT order
DB --> Service: order_id=456
Service --> Gateway: 201 Created
Gateway --> Client: 201 Created`,
      },
      {
        title: 'Payment Flow',
        markdown: `figure sequence
title: Payment Processing
actors: User, Frontend, Backend, Stripe, DB
User -> Frontend: Click Pay
Frontend -> Backend: POST /checkout
Backend -> Stripe: Create PaymentIntent
Stripe --> Backend: client_secret
Backend --> Frontend: client_secret
Frontend -> Stripe: Confirm payment
Stripe --> Frontend: Payment success
Stripe -> Backend: webhook succeeded
Backend -> DB: UPDATE order paid=true
Backend --> Frontend: Order confirmed`,
      },
      {
        title: 'WebSocket Chat',
        markdown: `figure sequence
title: WebSocket Chat
actors: Alice, Server, Bob
Alice -> Server: WS connect
Server --> Alice: Connected
Bob -> Server: WS connect
Server --> Bob: Connected
Alice -> Server: send "Hello Bob"
Server -> Bob: deliver "Hello Bob"
Bob --> Server: send "Hi Alice!"
Server --> Alice: deliver "Hi Alice!"`,
      },
      {
        title: 'File Upload',
        markdown: `figure sequence
title: File Upload Flow
actors: Browser, API, Storage, DB
Browser -> API: POST /upload
API -> Storage: Upload to S3
Storage --> API: object_key
API -> DB: INSERT file record
DB --> API: file_id=789
API --> Browser: file_id + url
Browser -> Storage: GET presigned URL
Storage --> Browser: File bytes`,
      },
      {
        title: 'Email Verification',
        markdown: `figure sequence
title: Email Verification Flow
actors: User, App, EmailService, DB
User -> App: POST /register
App -> DB: INSERT user pending
App -> EmailService: Send verify email
EmailService --> User: Email with token link
User -> App: GET /verify?token=abc
App -> DB: SELECT token
DB --> App: token valid
App -> DB: UPDATE user verified=true
App --> User: 200 Verified`,
      },
      {
        title: 'Inventory Check',
        markdown: `figure sequence
title: Inventory Check at Checkout
actors: Cart, OrderService, InventoryService, ReservationDB
Cart -> OrderService: POST /checkout
OrderService -> InventoryService: GET /stock?items=[...]
InventoryService -> ReservationDB: Check quantities
ReservationDB --> InventoryService: Stock available
InventoryService --> OrderService: All items in stock
OrderService -> ReservationDB: Reserve items
ReservationDB --> OrderService: Reservation ID
OrderService --> Cart: Proceed to payment`,
      },
      {
        title: 'Scheduled Job',
        markdown: `figure sequence
title: Nightly Report Job
actors: Scheduler, ReportWorker, DB, EmailService
Scheduler -> ReportWorker: trigger nightly_report
ReportWorker -> DB: SELECT metrics last 24h
DB --> ReportWorker: metric rows
ReportWorker -> DB: INSERT report snapshot
DB --> ReportWorker: report_id
ReportWorker -> EmailService: Send report PDF
EmailService --> ReportWorker: delivered
ReportWorker --> Scheduler: job complete`,
      },
    ],
  },
  {
    type: 'quadrant',
    label: 'Quadrant',
    examples: [
      {
        title: 'Feature Priority',
        markdown: `figure quadrant
title: Feature Priority Matrix
x-axis Effort: Low .. High
y-axis Impact: Low .. High
quadrant-1: Quick Wins
quadrant-2: Strategic
quadrant-3: Low Priority
quadrant-4: Hard Sells
Dark Mode: 0.1, 0.8
Search: 0.6, 0.9
Mobile App: 0.8, 0.7
Notifications: 0.2, 0.6
SSO Login: 0.5, 0.85
Bulk Export: 0.3, 0.4
API v2: 0.7, 0.5
Analytics: 0.65, 0.75`,
      },
      {
        title: 'Technical Debt',
        markdown: `figure quadrant
title: Technical Debt Assessment
x-axis Complexity: Low .. High
y-axis Risk: Low .. High
quadrant-1: Fix Now
quadrant-2: Plan Carefully
quadrant-3: Monitor
quadrant-4: Evaluate
Auth Module: 0.6, 0.9
DB Queries: 0.7, 0.8
CSS Legacy: 0.2, 0.2
API Layer: 0.5, 0.6
Logging: 0.15, 0.35
Test Coverage: 0.4, 0.7
Cache Layer: 0.45, 0.5
Config Mgmt: 0.3, 0.65`,
      },
      {
        title: 'Competitive Map',
        markdown: `figure quadrant
palette: antv
title: Competitive Landscape
x-axis Price: Low .. High
y-axis Features: Few .. Many
quadrant-1: Value Leaders
quadrant-2: Premium
quadrant-3: Basic
quadrant-4: Overpriced
ProductA: 0.15, 0.7
ProductB: 0.5, 0.85
ProductC: 0.8, 0.9
ProductD: 0.3, 0.3
ProductE: 0.7, 0.4
Ours: 0.35, 0.75`,
      },
      {
        title: 'Customer Segments',
        markdown: `figure quadrant
palette: figma
title: Customer Segment Map
x-axis Size: Small .. Large
y-axis Growth: Slow .. Fast
quadrant-1: Hidden Gems
quadrant-2: Star Accounts
quadrant-3: Long Tail
quadrant-4: Mature Giants
Series A SaaS: 0.25, 0.85
Enterprise Corp: 0.9, 0.3
Hypergrowth: 0.5, 0.95
SMB Retail: 0.15, 0.2
Mid-Market: 0.55, 0.6
Fintech: 0.4, 0.75`,
      },
      {
        title: 'Risk Matrix',
        markdown: `figure quadrant
palette: mono-orange
title: Project Risk Matrix
x-axis Likelihood: Low .. High
y-axis Impact: Low .. High
quadrant-1: Watch
quadrant-2: Mitigate
quadrant-3: Accept
quadrant-4: Transfer
Scope Creep: 0.7, 0.75
Key Person: 0.4, 0.85
Tech Debt: 0.6, 0.5
Budget: 0.3, 0.7
Timeline: 0.65, 0.6
Vendor Lock: 0.25, 0.45`,
      },
      {
        title: 'Product Backlog',
        markdown: `figure quadrant
palette: figma
title: Product Backlog Prioritization
x-axis Dev Effort: Low .. High
y-axis Business Value: Low .. High
quadrant-1: Do First
quadrant-2: Plan
quadrant-3: Reconsider
quadrant-4: Deprioritize
Onboarding Wizard: 0.2, 0.9
API Webhooks: 0.5, 0.8
Custom Reports: 0.75, 0.85
Dark Mode: 0.15, 0.6
Keyboard Shortcuts: 0.1, 0.45
Data Export CSV: 0.2, 0.7
Audit Logs: 0.4, 0.6
SSO Integration: 0.55, 0.9`,
      },
      {
        title: 'Vendor Evaluation',
        markdown: `figure quadrant
palette: antv
title: Vendor Evaluation Matrix
x-axis Total Cost: Low .. High
y-axis Capability: Low .. High
quadrant-1: Best Value
quadrant-2: Premium Tier
quadrant-3: Budget Options
quadrant-4: Avoid
VendorA: 0.2, 0.85
VendorB: 0.6, 0.9
VendorC: 0.45, 0.5
VendorD: 0.8, 0.35
VendorE: 0.3, 0.65
VendorF: 0.75, 0.7`,
      },
      {
        title: 'Team Skills Gap',
        markdown: `figure quadrant
palette: mono-purple
title: Team Skills Assessment
x-axis Current Proficiency: Low .. High
y-axis Business Need: Low .. High
quadrant-1: Train Now
quadrant-2: Leverage
quadrant-3: Deprioritize
quadrant-4: Hire or Outsource
Kubernetes: 0.3, 0.9
React: 0.8, 0.85
Data Engineering: 0.2, 0.7
ML Ops: 0.15, 0.8
GraphQL: 0.6, 0.5
Security Hardening: 0.35, 0.75`,
      },
    ],
  },
  {
    type: 'gantt',
    label: 'Gantt',
    examples: [
      {
        title: 'Q1 Roadmap',
        markdown: `figure gantt
title: Q1 Product Roadmap
section Discovery
  User Research: t1, 2025-01-06, 2025-01-17
  Spec Writing: t2, 2025-01-13, 2025-01-24
section Design
  Wireframes: t3, 2025-01-20, 2025-02-07
  Visual Design: t4, 2025-02-03, 2025-02-21
section Development
  Frontend: t5, 2025-02-10, 2025-03-07
  Backend: t6, 2025-02-10, 2025-02-28
section Launch
  QA Testing: t7, 2025-02-24, 2025-03-14
  Beta Release: t8, 2025-03-10, 2025-03-21
milestone: Public Launch, 2025-03-28`,
      },
      {
        title: 'Sprint Plan',
        markdown: `figure gantt
title: Sprint 12 Plan
section Frontend
  Login Redesign: t1, 2025-02-03, 2025-02-07
  Dashboard v2: t2, 2025-02-06, 2025-02-14
  Mobile Nav: t3, 2025-02-10, 2025-02-14
section Backend
  Auth Refactor: t4, 2025-02-03, 2025-02-10
  Search API: t5, 2025-02-06, 2025-02-14
section QA
  E2E Tests: t6, 2025-02-12, 2025-02-14
milestone: Sprint Demo, 2025-02-14`,
      },
      {
        title: 'Website Redesign',
        markdown: `figure gantt
title: Website Redesign Project
section Research
  Stakeholder Interviews: t1, 2025-01-06, 2025-01-17
  Competitor Analysis: t2, 2025-01-10, 2025-01-24
section Design
  Brand Refresh: t3, 2025-01-20, 2025-02-14
  Page Designs: t4, 2025-02-03, 2025-02-28
section Build
  CMS Setup: t5, 2025-02-17, 2025-02-28
  Development: t6, 2025-02-24, 2025-03-21
  Content Migration: t7, 2025-03-10, 2025-03-28
milestone: Go Live, 2025-04-01`,
      },
      {
        title: 'Hiring Plan',
        markdown: `figure gantt
title: Engineering Hiring Plan
section Role Definition
  Job Descriptions: t1, 2025-01-06, 2025-01-17
  Compensation Bands: t2, 2025-01-10, 2025-01-17
section Sourcing
  Post Jobs: t3, 2025-01-20, 2025-02-07
  Recruiter Outreach: t4, 2025-01-20, 2025-02-21
section Interviews
  Phone Screens: t5, 2025-02-03, 2025-02-28
  Onsite Rounds: t6, 2025-02-17, 2025-03-14
section Offers
  Offers Extended: t7, 2025-03-10, 2025-03-21
  Negotiation: t8, 2025-03-17, 2025-03-28
milestone: Start Dates, 2025-04-07`,
      },
      {
        title: 'DB Migration',
        markdown: `figure gantt
title: Database Migration Plan
section Preparation
  Audit Current DB: t1, 2025-02-03, 2025-02-14
  Design Schema: t2, 2025-02-10, 2025-02-21
section Development
  Migration Scripts: t3, 2025-02-17, 2025-03-07
  Backfill Jobs: t4, 2025-02-24, 2025-03-14
section Testing
  Staging Migration: t5, 2025-03-03, 2025-03-14
  Data Validation: t6, 2025-03-10, 2025-03-21
section Cutover
  Maintenance Window: t7, 2025-03-24, 2025-03-24
  Go Live: t8, 2025-03-25, 2025-03-28
milestone: Migration Complete, 2025-03-28`,
      },
      {
        title: 'Product Launch',
        markdown: `figure gantt
title: New Feature Launch
section Planning
  Scope Definition: t1, 2025-01-06, 2025-01-17
  OKR Alignment: t2, 2025-01-13, 2025-01-17
section Build
  Backend API: t3, 2025-01-20, 2025-02-14
  Frontend UI: t4, 2025-01-27, 2025-02-21
  Analytics Events: t5, 2025-02-10, 2025-02-21
section Validation
  Internal Beta: t6, 2025-02-24, 2025-03-07
  Fix Feedback: t7, 2025-03-03, 2025-03-14
section Launch
  Rollout 10%: t8, 2025-03-17, 2025-03-21
  Full Release: t9, 2025-03-24, 2025-03-28
milestone: GA Launch, 2025-03-28`,
      },
      {
        title: 'Security Audit',
        markdown: `figure gantt
title: Annual Security Audit
section Pre-Audit
  Asset Inventory: t1, 2025-01-06, 2025-01-17
  Policy Review: t2, 2025-01-13, 2025-01-24
section Assessment
  Vulnerability Scan: t3, 2025-01-20, 2025-02-07
  Pen Testing: t4, 2025-02-03, 2025-02-28
section Remediation
  Critical Fixes: t5, 2025-02-24, 2025-03-14
  Medium Fixes: t6, 2025-03-03, 2025-03-21
section Reporting
  Draft Report: t7, 2025-03-17, 2025-03-28
  Board Review: t8, 2025-03-25, 2025-03-28
milestone: Audit Signed Off, 2025-03-28`,
      },
      {
        title: 'Marketing Campaign',
        markdown: `figure gantt
title: Product Marketing Campaign
section Strategy
  Audience Research: t1, 2025-01-06, 2025-01-17
  Messaging Workshop: t2, 2025-01-13, 2025-01-24
section Creative
  Copywriting: t3, 2025-01-20, 2025-02-07
  Design Assets: t4, 2025-01-27, 2025-02-14
section Channels
  Email Sequences: t5, 2025-02-10, 2025-02-21
  Social Posts: t6, 2025-02-10, 2025-02-28
  Paid Ads: t7, 2025-02-17, 2025-03-07
section Measurement
  A/B Testing: t8, 2025-02-24, 2025-03-14
  Performance Review: t9, 2025-03-17, 2025-03-28
milestone: Campaign Wrap, 2025-03-28`,
      },
    ],
  },
  {
    type: 'state',
    label: 'State Machine',
    examples: [
      {
        title: 'Order Lifecycle',
        markdown: `figure state
title: Order Lifecycle
pending[Pending]
confirmed[Confirmed]
processing[Processing]
shipped[Shipped]
accent: cancelled
cancelled[Cancelled]
start --> pending
pending --> confirmed: payment received
confirmed --> processing: warehouse picked
processing --> shipped: handed to carrier
shipped --> end: delivered
pending --> cancelled: timed out
confirmed --> cancelled: customer cancelled`,
      },
      {
        title: 'User Account',
        markdown: `figure state
title: User Account States
registered[Registered]
active[Active]
suspended[Suspended]
accent: banned
banned[Banned]
start --> registered: sign up
registered --> active: email verified
active --> suspended: violation
suspended --> active: appeal approved
active --> banned: severe violation
suspended --> banned: repeat offense
banned --> end: account deleted`,
      },
      {
        title: 'Payment Status',
        markdown: `figure state
title: Payment Status Machine
initiated[Initiated]
authorized[Authorized]
captured[Captured]
accent: failed
failed[Failed]
start --> initiated: create charge
initiated --> authorized: bank approved
authorized --> captured: merchant settled
initiated --> failed: bank declined
authorized --> failed: capture error
failed --> initiated: retry
captured --> end: reconciled`,
      },
      {
        title: 'Pull Request',
        markdown: `figure state
title: Pull Request Workflow
draft[Draft]
open[Open Review]
changes[Changes Requested]
approved[Approved]
accent: closed
closed[Closed]
start --> draft: create PR
draft --> open: mark ready
open --> changes: reviewer requests changes
changes --> open: author pushes fix
open --> approved: all reviewers approve
approved --> end: merged
open --> closed: abandoned`,
      },
      {
        title: 'Subscription',
        markdown: `figure state
title: Subscription Lifecycle
trialing[Trial]
active[Active]
pastdue[Past Due]
accent: cancelled
cancelled[Cancelled]
start --> trialing: sign up
trialing --> active: card charged
active --> pastdue: payment failed
pastdue --> active: payment retried
pastdue --> cancelled: max retries exceeded
active --> cancelled: user cancels
trialing --> cancelled: no conversion
cancelled --> active: resubscribe`,
      },
      {
        title: 'Support Ticket',
        markdown: `figure state
title: Support Ticket Lifecycle
open[Open]
assigned[Assigned]
inprogress[In Progress]
pending[Pending Customer]
accent: escalated
escalated[Escalated]
start --> open: ticket created
open --> assigned: agent picks up
assigned --> inprogress: work started
inprogress --> pending: awaiting reply
pending --> inprogress: customer replies
inprogress --> escalated: complex issue
escalated --> inprogress: senior assigned
inprogress --> end: resolved
pending --> end: auto-closed`,
      },
      {
        title: 'Document Approval',
        markdown: `figure state
title: Document Approval Workflow
draft[Draft]
review[Under Review]
revisions[Revisions Required]
approved[Approved]
accent: rejected
rejected[Rejected]
start --> draft: create document
draft --> review: submit for review
review --> revisions: changes needed
revisions --> review: resubmit
review --> approved: all reviewers sign off
review --> rejected: rejected by committee
approved --> end: published
rejected --> draft: revise and restart`,
      },
      {
        title: 'Package Delivery',
        markdown: `figure state
title: Package Delivery Tracking
picked[Picked Up]
transit[In Transit]
hub[At Sorting Hub]
outdelivery[Out for Delivery]
accent: failed
failed[Delivery Failed]
start --> picked: carrier scans
picked --> transit: departed facility
transit --> hub: arrived at hub
hub --> outdelivery: loaded on truck
outdelivery --> end: delivered
outdelivery --> failed: no one home
failed --> outdelivery: retry next day
failed --> end: returned to sender`,
      },
    ],
  },
  {
    type: 'er',
    label: 'ER Diagram',
    examples: [
      {
        title: 'Blog Platform',
        markdown: `figure er
title: Blog Platform Schema
accent: User
entity User
  id pk: uuid
  email: text
  username: text
  created_at: timestamp
entity Post
  id pk: uuid
  author_id fk: uuid
  title: text
  body: text
  published_at: timestamp
entity Comment
  id pk: uuid
  post_id fk: uuid
  author_id fk: uuid
  body: text
entity Tag
  id pk: uuid
  name: text
User --> Post: writes
Post --> Comment: has
User --> Comment: writes
Post --> Tag: tagged with`,
      },
      {
        title: 'E-Commerce',
        markdown: `figure er
title: E-Commerce Schema
accent: Order
entity Customer
  id pk: uuid
  email: text
  name: text
entity Order
  id pk: uuid
  customer_id fk: uuid
  status: text
  total: numeric
entity OrderItem
  id pk: uuid
  order_id fk: uuid
  product_id fk: uuid
  quantity: integer
entity Product
  id pk: uuid
  sku: text
  name: text
  price: numeric
Customer --> Order: places
Order --> OrderItem: contains
Product --> OrderItem: included in`,
      },
      {
        title: 'SaaS Multi-Tenant',
        markdown: `figure er
title: SaaS Multi-Tenant
accent: Organization
entity Organization
  id pk: uuid
  name: text
  plan: text
entity User
  id pk: uuid
  org_id fk: uuid
  email: text
  role: text
entity Project
  id pk: uuid
  org_id fk: uuid
  name: text
entity Membership
  user_id fk: uuid
  project_id fk: uuid
  role: text
Organization --> User: has
Organization --> Project: owns
User --> Membership: holds
Project --> Membership: grants`,
      },
      {
        title: 'Social Network',
        markdown: `figure er
title: Social Network Schema
accent: User
entity User
  id pk: uuid
  username: text
  bio: text
entity Post
  id pk: uuid
  author_id fk: uuid
  content: text
  created_at: timestamp
entity Follow
  follower_id fk: uuid
  following_id fk: uuid
entity Like
  user_id fk: uuid
  post_id fk: uuid
  created_at: timestamp
User --> Post: authors
User --> Follow: follows
User --> Like: likes
Post --> Like: receives`,
      },
      {
        title: 'HR System',
        markdown: `figure er
title: HR System Schema
accent: Employee
entity Department
  id pk: uuid
  name: text
  budget: numeric
entity Employee
  id pk: uuid
  dept_id fk: uuid
  manager_id fk: uuid
  name: text
  title: text
  salary: numeric
entity Review
  id pk: uuid
  employee_id fk: uuid
  reviewer_id fk: uuid
  score: integer
  period: text
Department --> Employee: employs
Employee --> Employee: manages
Employee --> Review: receives`,
      },
      {
        title: 'Event Booking',
        markdown: `figure er
title: Event Booking Schema
accent: Booking
entity Event
  id pk: uuid
  name: text
  venue: text
  date: timestamp
  capacity: integer
entity Attendee
  id pk: uuid
  email: text
  name: text
entity Booking
  id pk: uuid
  event_id fk: uuid
  attendee_id fk: uuid
  seat: text
  status: text
entity Payment
  id pk: uuid
  booking_id fk: uuid
  amount: numeric
  paid_at: timestamp
Event --> Booking: has
Attendee --> Booking: makes
Booking --> Payment: paid by`,
      },
      {
        title: 'Inventory Mgmt',
        markdown: `figure er
title: Inventory Management
accent: Product
entity Warehouse
  id pk: uuid
  name: text
  location: text
entity Product
  id pk: uuid
  sku: text
  name: text
  unit_cost: numeric
entity StockLevel
  warehouse_id fk: uuid
  product_id fk: uuid
  quantity: integer
  reorder_point: integer
entity PurchaseOrder
  id pk: uuid
  product_id fk: uuid
  quantity: integer
  received_at: timestamp
Warehouse --> StockLevel: tracks
Product --> StockLevel: stored in
Product --> PurchaseOrder: ordered via`,
      },
      {
        title: 'LMS Schema',
        markdown: `figure er
title: Learning Management System
accent: Enrollment
entity Course
  id pk: uuid
  title: text
  instructor_id fk: uuid
entity Lesson
  id pk: uuid
  course_id fk: uuid
  title: text
  position: integer
entity Student
  id pk: uuid
  email: text
  name: text
entity Enrollment
  id pk: uuid
  student_id fk: uuid
  course_id fk: uuid
  enrolled_at: timestamp
  progress: integer
entity Completion
  enrollment_id fk: uuid
  lesson_id fk: uuid
  completed_at: timestamp
Course --> Lesson: has
Student --> Enrollment: joins
Course --> Enrollment: has
Enrollment --> Completion: tracks`,
      },
    ],
  },
  {
    type: 'timeline',
    label: 'Timeline',
    examples: [
      {
        title: 'Product History',
        markdown: `figure timeline
title: Product Version History
2022-03-01: v0.1 Internal Alpha milestone
2022-07-15: v0.5 Private Beta
2022-11-20: v1.0 Public Launch milestone
2023-04-10: v1.5 Dark Mode & Themes
2023-09-01: v2.0 AI Integration milestone
2024-01-15: v2.5 Mobile Support
2024-06-20: v3.0 Enterprise Tier milestone`,
      },
      {
        title: 'Company Milestones',
        markdown: `figure timeline
title: Company Milestones
2019-05-01: Founded in SF milestone
2019-11-01: Pre-seed Round $500K
2020-06-15: First 100 Customers
2021-02-01: Seed Round $5M milestone
2021-09-01: 10-Person Team
2022-04-01: Series A $20M milestone
2023-01-01: 1000 Customers milestone
2024-03-01: Profitability milestone`,
      },
      {
        title: 'JS Evolution',
        markdown: `figure timeline
title: JavaScript Evolution
1995-12-04: JavaScript 1.0 milestone
2009-12-03: ES5 Modern Baseline milestone
2015-06-17: ES6 Arrow Fns & Classes milestone
2017-06-28: ES2017 async/await
2019-06-04: ES2019 Optional Chaining
2020-06-16: ES2020 Nullish Coalescing milestone
2022-06-22: ES2022 Top-level await milestone`,
      },
      {
        title: 'Project Delivery',
        markdown: `figure timeline
palette: antv
title: Project Delivery Timeline
2025-01-06: Kickoff Meeting milestone
2025-01-20: Design Review
2025-02-03: Alpha Build
2025-02-17: Internal QA
2025-03-03: Beta Release milestone
2025-03-17: Customer Pilot
2025-04-01: GA Launch milestone
2025-04-15: Post-Launch Review`,
      },
      {
        title: 'Compliance Roadmap',
        markdown: `figure timeline
palette: mono-purple
title: Compliance Roadmap
2024-10-01: Gap Analysis milestone
2024-11-01: Policy Drafting
2024-12-01: Staff Training
2025-01-15: Internal Audit milestone
2025-02-15: Remediation Sprint
2025-03-15: External Audit milestone
2025-04-01: Certification Granted milestone`,
      },
      {
        title: 'Startup Funding',
        markdown: `figure timeline
palette: antv
title: Startup Funding History
2018-03-01: Founded & Bootstrapped milestone
2018-11-01: First Paying Customer
2019-06-15: Pre-Seed $750K milestone
2020-09-01: Seed Round $4M milestone
2021-08-01: Series A $18M milestone
2022-07-01: Series B $50M milestone
2023-05-01: Profitability milestone`,
      },
      {
        title: 'Cloud Migration',
        markdown: `figure timeline
palette: figma
title: Cloud Migration Journey
2024-01-15: Migration Assessment milestone
2024-03-01: Proof of Concept
2024-05-01: Non-Prod Migration milestone
2024-07-15: Data Migration Phase 1
2024-09-01: Production Cutover milestone
2024-11-01: Decommission On-Prem
2025-01-01: Cloud-Native Complete milestone`,
      },
      {
        title: 'Regulatory Changes',
        markdown: `figure timeline
palette: mono-orange
title: Regulatory Impact Timeline
2023-01-01: GDPR Fines Enforced milestone
2023-07-01: CCPA Amendments Active milestone
2024-01-01: EU AI Act Proposal
2024-06-01: SOC 2 Type II Renewal milestone
2024-09-01: PCI DSS v4 Deadline milestone
2025-01-01: EU AI Act Compliance Due milestone
2025-06-01: ISO 27001 Re-Certification`,
      },
    ],
  },
  {
    type: 'swimlane',
    label: 'Swimlane',
    examples: [
      {
        title: 'Order Fulfillment',
        markdown: `figure swimlane
title: Order Fulfillment
section Customer
  order[Place Order]
  receive[Receive Package]
section Sales
  confirm[Confirm Order]
  invoice[Send Invoice]
section Warehouse
  pick[Pick Items]
  pack[Pack Box]
section Shipping
  label[Print Label]
  ship[Hand to Carrier]
order --> confirm
confirm --> invoice
confirm --> pick
pick --> pack
pack --> label
label --> ship
ship --> receive`,
      },
      {
        title: 'Software Deploy',
        markdown: `figure swimlane
title: Software Deployment
section Developer
  commit[Push Commit]
  fix[Fix Issues]
section CI System
  build[Build & Test]
  scan[Security Scan]
section DevOps
  review[Deployment Review]
  deploy[Deploy to Prod]
section Monitoring
  health[Health Check]
  alert[Alert on Failure]
commit --> build
build --> scan
scan --> review
review --> deploy
deploy --> health
health --> alert
alert --> fix
fix --> commit`,
      },
      {
        title: 'Onboarding',
        markdown: `figure swimlane
title: Employee Onboarding
section HR
  offer[Send Offer Letter]
  docs[Collect Documents]
  payroll[Setup Payroll]
section IT
  accounts[Create Accounts]
  equipment[Provision Laptop]
section Manager
  intro[Team Introduction]
  plan[30-60-90 Plan]
section New Hire
  sign[Sign Contract]
  setup[Setup Workstation]
  start[Start Work]
offer --> sign
sign --> docs
sign --> accounts
accounts --> equipment
docs --> payroll
equipment --> setup
intro --> plan
payroll --> start
setup --> start
plan --> start`,
      },
      {
        title: 'Customer Support',
        markdown: `figure swimlane
title: Customer Support Flow
section Customer
  submit[Submit Ticket]
  respond[Provide Info]
  close[Close Ticket]
section L1 Support
  triage[Triage Issue]
  resolve[Resolve Issue]
section L2 Support
  escalate[Deep Investigation]
  fix[Apply Fix]
section Engineering
  bugfix[Patch & Deploy]
submit --> triage
triage --> resolve
resolve --> close
triage --> escalate
escalate --> fix
fix --> bugfix
bugfix --> respond
respond --> close`,
      },
      {
        title: 'Loan Application',
        markdown: `figure swimlane
title: Loan Application Process
section Applicant
  apply[Submit Application]
  docs[Upload Documents]
  sign[Sign Agreement]
section Loan Officer
  review[Review Application]
  request[Request More Docs]
  approve[Approve Loan]
section Underwriting
  assess[Risk Assessment]
  decision[Final Decision]
section Disbursement
  transfer[Transfer Funds]
apply --> review
review --> request
request --> docs
docs --> assess
assess --> decision
decision --> approve
approve --> sign
sign --> transfer`,
      },
      {
        title: 'Feature Development',
        markdown: `figure swimlane
title: Feature Development Flow
section Product
  spec[Write Spec]
  accept[Acceptance Test]
  close[Close Feature]
section Design
  mockup[Create Mockup]
  review[Design Review]
section Engineering
  implement[Implement Feature]
  unittest[Unit Tests]
section QA
  qa[QA Testing]
  regression[Regression Suite]
spec --> mockup
mockup --> review
review --> implement
implement --> unittest
unittest --> qa
qa --> regression
regression --> accept
accept --> close`,
      },
      {
        title: 'Procurement',
        markdown: `figure swimlane
title: Procurement Process
section Requester
  request[Submit Purchase Request]
  receive[Receive Goods]
section Manager
  approve[Approve Request]
section Procurement
  rfp[Issue RFP]
  select[Select Vendor]
  po[Create PO]
section Finance
  invoice[Process Invoice]
  payment[Release Payment]
request --> approve
approve --> rfp
rfp --> select
select --> po
po --> receive
receive --> invoice
invoice --> payment`,
      },
      {
        title: 'Bug Fix Flow',
        markdown: `figure swimlane
title: Production Bug Fix Workflow
section Reporter
  report[File Bug Report]
  verify[Verify Fix]
section Triage
  assess[Assess Severity]
  assign[Assign Engineer]
section Engineer
  investigate[Investigate Root Cause]
  fix[Implement Fix]
  pr[Open Pull Request]
section CI CD
  test[Run Test Suite]
  deploy[Deploy to Prod]
report --> assess
assess --> assign
assign --> investigate
investigate --> fix
fix --> pr
pr --> test
test --> deploy
deploy --> verify`,
      },
    ],
  },
  {
    type: 'bubble',
    label: 'Bubble Chart',
    examples: [
      {
        title: 'Market Share',
        markdown: `figure bubble
title: Market Share
subtitle: Revenue by product line
palette: default
Product A: 75
Product B: 50
Product C: 85
Product D: 30
Product E: 60
Product F: 20`,
      },
      {
        title: 'Tech Languages',
        markdown: `figure bubble
title: Tech Stack Adoption
subtitle: Community size by language
palette: antv
theme: dark
Python: 90
Java: 85
Go: 65
Node.js: 80
Rust: 45
C++: 40
Kotlin: 50`,
      },
      {
        title: 'Budget Allocation',
        markdown: `figure bubble
title: Budget Allocation
subtitle: Q1 2025
palette: figma
Engineering: 420
Marketing: 250
R&D: 380
Sales: 300
Support: 120
HR: 80`,
      },
      {
        title: 'Server Requests',
        markdown: `figure bubble
title: Server Request Volume
subtitle: Last 24 hours
palette: mono-blue
theme: dark
web-01: 8200
api-01: 6500
api-02: 5800
worker-01: 4400
worker-02: 3700
db-01: 3200
cache-01: 2100
cron-01: 1100`,
      },
      {
        title: 'Energy Mix',
        markdown: `figure bubble
title: Global Energy Mix
subtitle: Production by source (TWh)
palette: vega
Coal: 9400
Gas: 6700
Hydro: 4300
Nuclear: 2800
Wind: 2100
Solar: 1300
Oil: 900`,
      },
      {
        title: 'Social Media',
        markdown: `figure bubble
title: Social Media Reach
subtitle: Monthly active users (M)
palette: default
Facebook: 2900
YouTube: 2700
Instagram: 2000
TikTok: 1500
X: 550
LinkedIn: 950
Snapchat: 750`,
      },
      {
        title: 'Cloud Services',
        markdown: `figure bubble
title: Cloud Spend by Service
subtitle: Monthly cost breakdown
palette: mono-green
theme: dark
Compute: 12400
Storage: 4300
Database: 6800
Networking: 2900
ML: 5100
Security: 1800`,
      },
      {
        title: 'App Downloads',
        markdown: `figure bubble
title: App Downloads by Platform
subtitle: Q4 2024 (millions)
palette: antv
iOS: 820
Android: 1540
Web: 340
Desktop: 210`,
      },
      {
        title: 'Movie Box Office',
        markdown: `figure bubble
title: Box Office Revenue
subtitle: Worldwide gross (M USD)
palette: drawio
Action: 4200
Adventure: 3800
Animation: 2900
Drama: 1500
Comedy: 2100
Horror: 1200
Sci-Fi: 3100`,
      },
      {
        title: 'Portfolio',
        markdown: `figure bubble
title: Investment Portfolio
subtitle: Allocation by asset class
palette: mono-orange
Stocks: 4500
Bonds: 1200
Real Estate: 2800
Crypto: 600
Commodities: 900
Cash: 400`,
      },
      {
        title: 'Microservices',
        markdown: `figure bubble
title: Microservice Call Volume
subtitle: Requests per minute
palette: drawio
theme: dark
auth-svc: 3200
user-svc: 2800
order-svc: 4100
payment-svc: 1900
notify-svc: 1400
search-svc: 2300`,
      },
      {
        title: 'Country GDP',
        markdown: `figure bubble
title: Top Economies by GDP
subtitle: Trillion USD (2024)
palette: mono-purple
USA: 27400
China: 18500
Germany: 4400
Japan: 4300
India: 3700
UK: 3100
France: 3000`,
      },
      {
        title: 'Startup Funding',
        markdown: `figure bubble
title: Startup Funding Rounds
subtitle: Total raised (M USD)
palette: antv
theme: dark
Series A: 800
Series B: 2400
Series C: 5200
Series D: 8100
Seed: 250
Pre-Seed: 80`,
      },
      {
        title: 'Game Genres',
        markdown: `figure bubble
title: Game Sales by Genre
subtitle: Units sold (millions)
palette: figma
theme: dark
Action: 310
RPG: 240
Sports: 290
Strategy: 160
Simulation: 200
Shooter: 270
Puzzle: 130`,
      },
      {
        title: 'Company Headcount',
        markdown: `figure bubble
title: Headcount by Department
subtitle: Full-time employees
palette: default
Engineering: 480
Sales: 210
Marketing: 150
Operations: 320
Support: 190
Finance: 90
HR: 70`,
      },
      {
        title: 'Language Popularity',
        markdown: `figure bubble
title: Language Popularity Index
subtitle: Developer survey score
palette: vega
theme: dark
JavaScript: 95
Python: 92
TypeScript: 78
Java: 72
Rust: 45
Go: 62
Ruby: 38
Swift: 44`,
      },
    ],
  },
  {
    type: 'radar',
    label: 'Radar Chart',
    examples: [
      {
        title: 'Framework Comparison',
        markdown: `figure radar
title: Framework Comparison
subtitle: 2025 technical evaluation
palette: antv
axes: Performance, Scalability, DX, Ecosystem, Tooling
React: 75, 80, 90, 95, 88
Vue: 82, 72, 90, 82, 80
Angular: 65, 92, 72, 90, 86`,
      },
      {
        title: 'Skills Matrix',
        markdown: `figure radar
title: Engineering Skills Matrix
subtitle: Senior vs Mid-level
palette: default
axes: System Design, Coding, Testing, Communication, Leadership, Ownership
Senior: 92, 88, 85, 90, 88, 95
Mid: 70, 80, 75, 72, 60, 70`,
      },
      {
        title: 'Cloud Providers',
        markdown: `figure radar
title: Cloud Provider Comparison
subtitle: AWS vs Azure vs GCP
palette: figma
theme: dark
axes: Compute, Storage, Networking, ML/AI, Pricing, Support
AWS: 95, 90, 88, 85, 65, 80
Azure: 85, 85, 80, 88, 70, 85
GCP: 80, 82, 78, 95, 72, 75`,
      },
      {
        title: 'Product Quality',
        markdown: `figure radar
title: Product Quality Dimensions
palette: mono-blue
axes: Reliability, Performance, Security, Usability, Maintainability
v1.0: 60, 55, 70, 72, 58
v2.0: 88, 76, 92, 80, 70`,
      },
      {
        title: 'Team Velocity',
        markdown: `figure radar
title: Team Velocity
subtitle: Q1 – Q4 comparison
palette: vega
theme: dark
axes: Backend, Frontend, QA, DevOps
Q1: 70, 65, 80, 60
Q2: 75, 72, 82, 68
Q3: 80, 78, 85, 75
Q4: 88, 85, 90, 82`,
      },
      {
        title: 'Security Assessment',
        markdown: `figure radar
title: Security Posture
subtitle: Quarterly assessment
palette: mono-green
axes: Authentication, Authorization, Encryption, Monitoring, Patching, Audit
Before: 55, 60, 70, 45, 50, 40
After: 90, 88, 95, 82, 85, 78`,
      },
      {
        title: 'Tech Debt',
        markdown: `figure radar
title: Technical Debt Heatmap
subtitle: by engineering area
palette: drawio
theme: dark
axes: Architecture, Test Coverage, Documentation, Dependencies, Code Style
Frontend: 35, 55, 60, 70, 80
Backend: 60, 40, 45, 55, 72
Platform: 70, 75, 50, 60, 65`,
      },
      {
        title: 'Candidate Evaluation',
        markdown: `figure radar
title: Candidate Evaluation
subtitle: Senior SWE interview
palette: antv
theme: dark
axes: Algorithm, System Design, Communication, Culture Fit, Past Experience
Alice: 90, 85, 88, 82, 92
Bob: 78, 92, 72, 88, 80`,
      },
    ],
  },
];
