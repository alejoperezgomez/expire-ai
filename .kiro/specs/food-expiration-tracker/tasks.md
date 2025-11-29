# Implementation Plan

- [x] 1. Initialize project structure and dependencies
  - [x] 1.1 Set up Expo React Native project with TypeScript
    - Initialize new Expo project with TypeScript template
    - Configure Expo Router for file-based navigation
    - Install and configure React Native StyleSheet for styling (Tamagui not used)
    - Set up project directory structure (components, hooks, services, types, utils)
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 1.2 Set up Express backend with TypeScript
    - Initialize Node.js project with TypeScript configuration
    - Install Express, Prisma, and required dependencies
    - Configure tsconfig.json with strict mode
    - Set up project directory structure (routes, controllers, services, models, middleware)
    - _Requirements: 6.1, 7.2_

  - [x] 1.3 Configure database with Prisma
    - Create Prisma schema with User, FoodItem, and NotificationLog models
    - Set up SQLite connection configuration
    - Generate Prisma client and run initial migration
    - _Requirements: 6.1, 6.2_

- [x] 2. Implement shared types and utilities
  - [x] 2.1 Create shared TypeScript type definitions
    - Define FoodItem, CreateFoodItemInput, UpdateFoodItemInput interfaces
    - Define ScanReceiptResponse, ExtractedFoodItem, ScanLabelResponse types
    - Define TrafficLightStatus and FoodItemWithStatus types
    - Define ApiError interface for error handling
    - _Requirements: 7.2_

  - [x] 2.2 Implement date and status utility functions
    - Create calculateDaysUntilExpiration function
    - Create getTrafficLightStatus function with thresholds (green >3 days, yellow 1-3 days, red ≤0 days)
    - Create date formatting utilities for display
    - _Requirements: 3.2, 3.4_

- [x] 3. Build backend API endpoints
  - [x] 3.1 Implement food items CRUD routes
    - Create GET /api/food-items endpoint to fetch all user food items
    - Create GET /api/food-items/:id endpoint for single item
    - Create POST /api/food-items endpoint to create food item(s)
    - Create PUT /api/food-items/:id endpoint to update food item
    - Create DELETE /api/food-items/:id endpoint to delete food item
    - Add validation middleware for request bodies
    - _Requirements: 6.1, 6.3, 6.5_

  - [x] 3.2 Implement LLM service for image processing
    - Create llmService with multimodal API integration (OpenAI GPT-4o)
    - Implement processReceiptImage function with receipt scanning prompt
    - Implement processLabelImage function with label scanning prompt
    - Add response parsing and confidence scoring
    - _Requirements: 1.2, 1.3, 2.1, 4.4_

  - [x] 3.3 Implement scan routes
    - Create POST /api/scan/receipt endpoint for receipt processing
    - Create POST /api/scan/label endpoint for label processing
    - Handle image upload and base64 encoding
    - Return extracted food items with expiration estimates
    - _Requirements: 1.2, 1.3, 2.1, 4.3, 4.4_

  - [x] 3.4 Implement error handling middleware
    - Create centralized error handler middleware
    - Define error codes (CAMERA_PERMISSION_DENIED, IMAGE_PROCESSING_FAILED, etc.)
    - Format consistent error responses
    - _Requirements: 1.4, 1.5, 2.4_

  - [ ]* 3.5 Write unit tests for backend services
    - Test LLM service response parsing
    - Test food item CRUD operations
    - Test date utility functions
    - _Requirements: 3.2, 2.1_

- [x] 4. Build core mobile UI components
  - [x] 4.1 Create ExpirationBadge component
    - Implement traffic light color styling (green, yellow, red)
    - Display days until expiration text
    - Use React Native StyleSheet styling
    - _Requirements: 3.2, 7.1_

  - [x] 4.2 Create FoodCard component
    - Display food item name, purchase date, expiration date
    - Integrate ExpirationBadge for status display
    - Show estimated vs user-set indicator ("Est." badge)
    - Add press handler for navigation to detail
    - Add delete button
    - _Requirements: 3.1, 3.2, 2.3, 4.5, 7.1_

  - [x] 4.3 Create FoodCardList component
    - Implement scrollable list using FlatList
    - Sort items by expiration date (soonest first)
    - Add pull-to-refresh functionality
    - Include EmptyState component when no items
    - _Requirements: 3.3, 3.4, 7.1_

  - [x] 4.4 Create DatePicker component
    - Implement date selection UI with calendar and manual input modes
    - Support both calendar and manual input modes
    - Add validation for reasonable date ranges
    - _Requirements: 4.1, 4.2, 7.1_

  - [x] 4.5 Create LoadingSpinner and EmptyState components
    - Implement loading indicator for async operations
    - Create empty state with illustration and call-to-action
    - _Requirements: 7.1, 7.4_

- [x] 5. Implement camera functionality
  - [x] 5.1 Create CameraView component
    - Integrate expo-camera for viewfinder display
    - Implement camera permission request flow
    - Add capture button and flash toggle
    - Support both receipt and label scanning modes
    - Handle camera initialization errors
    - Support image picker for simulator testing
    - _Requirements: 1.1, 1.4, 4.3, 7.1_

  - [x] 5.2 Create useCamera hook
    - Manage camera permissions state
    - Handle image capture and URI management
    - Provide error handling callbacks
    - _Requirements: 1.1, 1.4_

- [x] 6. Build app screens and navigation
  - [x] 6.1 Set up Expo Router navigation structure
    - Configure tab navigation layout with home and scan tabs
    - Set up food item detail route with dynamic [id] parameter
    - Configure navigation theming
    - _Requirements: 7.1, 7.4_

  - [x] 6.2 Implement Home screen (food list)
    - Integrate FoodCardList component
    - Fetch food items on mount using useFoodItems hook
    - Handle loading and error states
    - Navigate to detail screen on card press
    - Show offline indicator
    - _Requirements: 3.1, 3.3, 6.2_

  - [x] 6.3 Implement Scan screen
    - Integrate CameraView component
    - Show loading state during LLM processing
    - Display extracted items for user confirmation
    - Allow user to edit/remove items before saving
    - Save confirmed items to database
    - Handle scan errors with retry option
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2_

  - [x] 6.4 Implement Food Detail screen
    - Display full food item information
    - Integrate DatePicker for expiration date editing
    - Add "Scan Label" button to open camera for date inference
    - Save changes to database on edit
    - Add delete functionality with confirmation
    - Show estimated date indicator banner
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 6.3, 6.5_

- [x] 7. Implement data layer and API integration
  - [x] 7.1 Create API client service
    - Set up fetch client with base URL configuration
    - Implement typed API methods for all endpoints
    - Add request timeout and error handling
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 7.2 Create useFoodItems hook
    - Fetch food items from API
    - Calculate and attach traffic light status to each item
    - Provide add, update, delete mutation functions
    - Handle loading and error states
    - _Requirements: 3.2, 3.4, 6.2, 6.3_

  - [x] 7.3 Implement offline support
    - Queue failed API calls in AsyncStorage
    - Sync queued operations when connectivity restored
    - Cache food items for offline viewing
    - Show offline indicator in UI (OfflineIndicator component)
    - _Requirements: 6.4_

- [x] 8. Implement push notifications
  - [x] 8.1 Set up Expo Push Notifications in mobile app
    - Configure expo-notifications
    - Request notification permissions
    - Register push token with backend
    - Handle notification tap to navigate to food item
    - _Requirements: 5.4, 5.5_

  - [x] 8.2 Implement notification service in backend
    - Create notification scheduling service
    - Query food items expiring in 3, 1, 0 days
    - Check NotificationLog to prevent duplicates
    - Send notifications via Expo Push API
    - Log sent notifications
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 8.3 Set up notification cron job
    - Configure daily cron job (9:00 AM)
    - Integrate with notification service
    - Handle batch notification sending
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 9. Final integration and polish
  - [x] 9.1 Implement responsive layouts
    - Safe area handling implemented via react-native-safe-area-context
    - Touch targets meet accessibility guidelines (buttons have adequate padding)
    - Layouts adapt to different screen sizes using flex
    - _Requirements: 7.4_

  - [x] 9.2 Add loading states and error boundaries
    - LoadingSpinner component implemented for async operations
    - Error states handled in screens with user-friendly messages
    - Retry options provided for failed operations
    - _Requirements: 1.4, 1.5, 2.4_

  - [ ]* 9.3 Write integration tests for critical flows
    - Test receipt scan → item creation flow
    - Test manual date editing flow
    - Test notification registration
    - _Requirements: 1.2, 4.2, 5.4_
