# ADR: AWS-Based Production Deployment

**Date:** 2025-12-04
**Status:** Accepted

---

## 1. Context

The full-stack web application name **Conductor** under development will serve as a student–professor portal enabling users to view grades, assignments, announcements, and other course-related information.The **Conductor** backend is built with **Node.js and Fastify**.

We need a cloud infrastructure that:

* Hosts the application with high availability and reliability
* Provides managed services for database, compute, and networking
* Integrates with our existing Docker/container workflow

Given these requirements, we evaluated several cloud providers and deployment architectures. We decided to adopt **Amazon Web Services (AWS)**.

---

## 2. Decision

We adopt **Amazon Web Services (AWS)** as our cloud platform.

---

## 3. Rationale

### 3.1 AWS Advantages Over Other Cloud Providers

| Factor | AWS | Azure |
|--------|-----|-------|
| **Market Leader** | Largest share, most mature | Strong for Microsoft shops |
| **Service Breadth** | 200+ services | 100+ services |
| **Documentation** | Extensive, community support | Good but Azure-centric |
| **Learning Value** | Industry standard, resume value | Growing |

**Decision: AWS** because:
* Most widely used in industry (68% market share in 2024)
* Best learning investment for students (most job postings mention AWS)
* Mature, well-documented managed services
* Strong free tier for educational/demo projects
* Team familiarity (if any prior cloud experience exists)

## 4. Alternatives

### 4.1 Platform-as-a-Service

**Pros:**
* Extremely simple deployment
* Managed Postgres included
* Auto-scaling, zero config

**Cons:**
* **Lock-in**: Fixed deployment process, hard to migrate
* **Limited learning**: Doesn't teach cloud fundamentals (IaaS/containers/networking)
* **Less control**: Can't customize infrastructure

### 4.2 DigitalOcean App Platform

**Pros:**
* Simpler than AWS
* Cheaper than PaaS options
* Good documentation

**Cons:**
* **Smaller ecosystem**: Fewer services, less mature
* **Career value**: Less relevant for the market (AWS dominates)

### 4.3 Microsoft Azure

**Pros:**
* Strong for organizations using Microsoft stack
* Enterprise-focused features
* Good integration with .NET

**Cons:**
* **Less intuitive UI**: More complex than AWS console
* **Not our tech stack**: We use Node.js, not .NET
* **Less community support**: Smaller open-source community

In fact, AWS better fits our tech stack and has broader adoption.

---

## 5. Consequences

### 5.1 Positive Consequences

**Production-ready deployment**
* Application publicly accessible via HTTPS
* Demonstrates real-world deployment capability

**Operational visibility**
* Metrics for performance monitoring
* Alarms for critical failures

**Security improvements**
* Secrets stored in Secrets Manager (not in code/images)
* HTTPS enforced

**CI/CD maturity**
* Automated deployments
* Rollback capability (previous versions)

### 5.2 Negative Consequences / Tradeoffs

**Increased complexity**
* More moving parts: security groups, IAM roles
* Debugging requires understanding of AWS-specific concepts

**Cost** (after free tier expires)
* Estimated monthly cost: $30-50 for small-scale deployment

**Network complexity**
* Security group rules must be carefully managed