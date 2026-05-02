# AirTable Data Structure and Logic

## Overview

This document outlines the data structure and logic for the PE/VC Portfolio Manager application, which uses AirTable as the single source of truth for all portfolio data. The local database serves as a read-only mirror of the AirTable data.

## Core Principles

- **AirTable as Master**: AirTable is the authoritative data source; the local database is a read-only mirror
- **No Preemptive Logic**: Visualizations are placeholders only - no built-in calculations or assumptions about PE/VC best practices
- **Data-Driven Approach**: All metrics and calculations should be based solely on the actual data structure from AirTable

## Table Structure

The system uses **5 core tables** synced from AirTable:

### 1. fund_info (Factor Table)
- **Purpose**: Contains basic metadata about funds
- **Type**: Factor/reference table
- **Contains**: Fund names, vintage years, asset classes, fund sizes, managers, etc.
- **Usage**: Serves as the master reference for fund information across other tables

### 2. net_cashflows (Data Table)
- **Purpose**: Contains net cashflow information 
- **Type**: Primary data table
- **Logic**: Each record represents the **net sum of distributions + drawdowns combined**
- **Key Concept**: This is the primary cashflow data - net cashflows commonly combine multiple elements (distributions and drawdowns) in a single transaction
- **Usage**: Main source for cashflow analysis and fund net cashflow tracking

### 3. detailed_net_cashflows (Data Table)
- **Purpose**: Detailed breakdown of net cashflow components
- **Type**: Data table linked to net_cashflows
- **Logic**: Splits the net cashflows from net_cashflows into sub-components:
  - **Higher level**: Distribution vs. Drawdown
  - **Detailed level**: 
    - Drawdown types: fees, investment capital, etc.
    - Distribution types: profit payouts, return of capital, etc.
- **Relationship**: Linked to net_cashflows table via foreign key relationship
- **Usage**: Provides granular analysis of cashflow composition

### 4. reported_metrics (Data Table)
- **Purpose**: Contains key metrics directly from General Partners (GPs)
- **Type**: Data table
- **Source**: Metrics come **directly from fund managers** - not computed internally
- **Contains**: IRR, TVPI, DPI, RVPI, NAV, and other performance metrics as reported
- **Future Use**: Will be compared against internally computed metrics for auditing purposes
- **Key Principle**: These are **reported values**, not calculated values

### 5. laddered_bonds (Data Table)  
- **Purpose**: Bond portfolio held to maturity
- **Type**: Data table
- **Logic**: Contains bonds positioned to match upcoming forecasted capital calls
- **Strategic Use**: Will be used to compute liquidity needs and cash management
- **Contains**: Bond details, maturity dates, face values, etc.

## Data Relationships

### Primary Relationships
- `detailed_net_cashflows.net_cashflow_id` → `net_cashflows.id`
- `net_cashflows.fund_id` → `fund_info.id` (via AirTable ID matching)
- `reported_metrics.fund_id` → `fund_info.id` (via AirTable ID matching)

### Key Linking Strategy
- Use AirTable IDs for cross-table relationships
- Maintain referential integrity through foreign key constraints where applicable
- Fund matching can be done via both AirTable ID and fund name fields

## What's Excluded

### Tables NOT Used
- **investments**: No investment-level tracking required at this time
- **distributions**: Distributions are captured within net_cashflows as net amounts
- **capital_calls**: Renamed to net_cashflows to better reflect the true nature of the data
- **detailed_capital_calls**: Renamed to detailed_net_cashflows to better reflect the true nature of the data

### Visualization Approach
- **No Built-in Logic**: Charts and metrics are placeholders only
- **No Assumptions**: No preemptive structuring based on PE/VC "best practices"
- **Data-First**: All future visualizations will be built based on actual data patterns

## Implementation Notes

### Sync Strategy
- AirTable serves as the master database
- Local PostgreSQL database mirrors AirTable data
- Sync operations update local tables based on AirTable changes
- Local database is read-only for application purposes

### Metrics Philosophy
- **Reported vs. Computed**: Distinction between GP-reported metrics and internally calculated metrics
- **Audit Trail**: Future capability to compare reported vs. computed values
- **No Premature Optimization**: Avoid building assumptions into the data model

### Future Capabilities
- Liquidity analysis using laddered_bonds data
- Audit comparisons between reported_metrics and computed values
- Detailed cashflow analysis using net_cashflows + detailed_net_cashflows breakdown

## Data Flow

1. **Source**: AirTable contains authoritative data across 5 tables
2. **Sync**: Application syncs data from AirTable to local PostgreSQL
3. **Storage**: Local database serves as read-only mirror
4. **Analysis**: Applications read from local database for performance
5. **Visualization**: Placeholder charts ready for future implementation based on actual data patterns

This structure ensures maximum flexibility while maintaining data integrity and avoiding premature assumptions about how the portfolio data should be analyzed or visualized.