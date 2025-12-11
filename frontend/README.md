# Frontend

Frontend files for the application.

## Architecture

### Routing
Routing is handled through **NGINX** for efficient request distribution and static file serving.

### Web Components
- **Conductor Form** serves as the parent component that orchestrates the primary application components
- Built using native Web Components for modularity and reusability

## Libraries & Dependencies

### Charting & Data Visualization
- **Chart.js** - Interactive charts and graphs
- **ZingGrid** - Table rendering and data grid functionality

### HTTP Request Wrapper Library
A lightweight JavaScript utility library that wraps the native Fetch API to provide:

- Dedicated wrapper functions for common HTTP methods (GET, POST, PATCH, DELETE)
- Automatic JSON serialization and content-type header management
- Built-in credential management for authorization
- Configurable timeout and retry logic
- Standardized response object (`ok`, `status`, `data`, `error`) for consistent error handling

**Purpose:** Standardizes all API calls through a single interface to:
- Provide consistent inputs and outputs across the application
- Reduce code redundancy
- Centralize error handling
- Simplify backend layer changes

**Usage:** Use the dedicated method wrappers (GET, POST, DELETE, PATCH) for standard requests. For advanced use cases requiring custom fetch options, use the `fetchWrapper` function directly.