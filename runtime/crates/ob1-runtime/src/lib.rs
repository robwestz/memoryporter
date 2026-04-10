//! OB1 Agentic Runtime — All 18 Infrastructure Primitives
//!
//! # Day 1 (Non-Negotiables)
//!
//! | # | Primitive | Module |
//! |---|----------|--------|
//! | 1 | Tool Registry | `registry` |
//! | 2 | Permission System | `permissions` |
//! | 3 | Session Persistence | `session` |
//! | 4 | Workflow State & Idempotency | `workflow` |
//! | 5 | Token Budget Tracking | `budget` |
//! | 6 | Structured Streaming Events | `streaming` |
//! | 7 | System Event Logging | `events` |
//! | 8 | Verification Harness | `verify` |
//!
//! # Week 1 (Operational Maturity)
//!
//! | # | Primitive | Module |
//! |---|----------|--------|
//! | 9 | Tool Pool Assembly | `permissions::ToolPool` |
//! | 10 | Transcript Compaction | `compaction` |
//! | 11 | Permission Audit Trail | `audit` |
//! | 12 | Doctor Pattern | `doctor` |
//! | 13 | Staged Boot Sequence | `boot` |
//! | 14 | Stop Reason Taxonomy | `budget::StopReason` |
//! | 15 | Provenance-Aware Context | `provenance` |
//!
//! # Month 1 (Scale & Sophistication)
//!
//! | # | Primitive | Module |
//! |---|----------|--------|
//! | 16 | Agent Type System | `agents` |
//! | 17 | Memory System | `memory` |
//! | 18 | Skills & Extensibility | `skills` |

// Day 1
pub mod registry;
pub mod permissions;
pub mod session;
pub mod workflow;
pub mod budget;
pub mod streaming;
pub mod events;
pub mod verify;

// Week 1
pub mod compaction;
pub mod audit;
pub mod doctor;
pub mod boot;
pub mod provenance;

// Month 1
pub mod agents;
pub mod memory;
pub mod skills;

// Integration
pub mod runtime;
pub mod anthropic;
pub mod tools;
