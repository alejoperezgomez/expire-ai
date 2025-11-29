# Requirements Document

## Introduction

This document defines the requirements for a mobile food expiration tracking application built with React Native (Expo) and an Express backend. The app allows users to scan shopping receipts using their phone camera, leverages a multimodal LLM to extract food items and estimate expiration dates, stores this data in a database, and provides a card-based UI for tracking food freshness. Users receive notifications before items expire and can manually adjust expiration dates or re-scan receipts for date inference.

## Glossary

- **FoodTracker**: The mobile application system for tracking food expiration
- **Receipt**: A shopping ticket/receipt containing purchased food items
- **Food_Item**: An individual food product extracted from a receipt with associated expiration data
- **Expiration_Date**: The estimated or manually set date when a food item is expected to expire
- **Traffic_Light_Status**: A visual indicator (green/yellow/red) representing freshness state
- **Multimodal_LLM**: An AI model capable of processing both text and images to extract information
- **Food_Card**: A UI component displaying a single food item's information and status

## Requirements

### Requirement 1: Receipt Scanning

**User Story:** As a user, I want to scan my shopping receipts with my phone camera, so that I can quickly add food items to my tracker without manual entry.

#### Acceptance Criteria

1. WHEN the user activates the camera scan feature, THE FoodTracker SHALL display a camera viewfinder for capturing receipt images.
2. WHEN the user captures a receipt image, THE FoodTracker SHALL send the image to the Multimodal_LLM for processing within 3 seconds.
3. WHEN the Multimodal_LLM processes a receipt image, THE FoodTracker SHALL extract all identifiable food items and display them for user confirmation.
4. IF the camera fails to initialize, THEN THE FoodTracker SHALL display an error message and provide a retry option.
5. IF the Multimodal_LLM cannot extract any food items from the image, THEN THE FoodTracker SHALL notify the user and suggest retaking the photo.

### Requirement 2: AI-Powered Expiration Estimation

**User Story:** As a user, I want the app to automatically estimate expiration dates for my food items, so that I don't have to research shelf life for each product.

#### Acceptance Criteria

1. WHEN the Multimodal_LLM extracts food items from a receipt, THE FoodTracker SHALL generate an estimated Expiration_Date for each Food_Item based on typical shelf life data.
2. THE FoodTracker SHALL store each Food_Item with its name, purchase date, and estimated Expiration_Date in the database.
3. WHEN displaying estimated expiration dates, THE FoodTracker SHALL indicate that the date is an AI estimate versus a manually set date.
4. IF the Multimodal_LLM cannot determine an expiration estimate for a Food_Item, THEN THE FoodTracker SHALL prompt the user to manually enter an Expiration_Date.

### Requirement 3: Food Item Card Display

**User Story:** As a user, I want to see all my food items displayed as cards with clear visual indicators, so that I can quickly assess what needs to be used soon.

#### Acceptance Criteria

1. THE FoodTracker SHALL display each Food_Item as a Food_Card containing the item name, purchase date, and Expiration_Date.
2. THE FoodTracker SHALL assign a Traffic_Light_Status to each Food_Card based on proximity to Expiration_Date:
   - Green: More than 3 days until expiration
   - Yellow: 1-3 days until expiration
   - Red: Expired or expires today
3. WHEN the user views the food items list, THE FoodTracker SHALL sort Food_Cards by Expiration_Date with soonest expiring items first.
4. THE FoodTracker SHALL update Traffic_Light_Status automatically when the app is opened or refreshed.

### Requirement 4: Manual Expiration Date Adjustment

**User Story:** As a user, I want to manually adjust expiration dates for my food items, so that I can correct AI estimates or enter dates I know from product labels.

#### Acceptance Criteria

1. WHEN the user selects a Food_Card, THE FoodTracker SHALL display options to edit the Expiration_Date.
2. WHEN the user manually updates an Expiration_Date, THE FoodTracker SHALL save the change to the database within 2 seconds.
3. WHEN the user chooses to scan for expiration date, THE FoodTracker SHALL open the camera to capture a product label or receipt showing the expiration date.
4. WHEN a product label image is captured, THE FoodTracker SHALL use the Multimodal_LLM to extract and set the Expiration_Date.
5. THE FoodTracker SHALL mark manually adjusted dates as "user-set" to distinguish from AI estimates.

### Requirement 5: Expiration Notifications

**User Story:** As a user, I want to receive notifications before my food expires, so that I can use items before they go bad and reduce waste.

#### Acceptance Criteria

1. THE FoodTracker SHALL send a push notification 3 days before a Food_Item's Expiration_Date.
2. THE FoodTracker SHALL send a push notification 1 day before a Food_Item's Expiration_Date.
3. THE FoodTracker SHALL send a push notification on the day a Food_Item expires.
4. WHEN the user taps a notification, THE FoodTracker SHALL navigate to the corresponding Food_Card.
5. WHERE the user has disabled notifications, THE FoodTracker SHALL respect the device notification settings and not send push notifications.

### Requirement 6: Data Persistence

**User Story:** As a user, I want my food items to be saved and synced, so that I don't lose my data and can access it across sessions.

#### Acceptance Criteria

1. THE FoodTracker SHALL persist all Food_Item data to a backend database via the Express API.
2. WHEN the app launches, THE FoodTracker SHALL fetch and display the user's Food_Items from the database within 5 seconds.
3. WHEN a Food_Item is added, updated, or deleted, THE FoodTracker SHALL sync the change to the backend database.
4. IF the network connection is unavailable, THEN THE FoodTracker SHALL queue changes locally and sync when connectivity is restored.
5. THE FoodTracker SHALL provide the ability to delete Food_Items that have been consumed or discarded.

### Requirement 7: User Interface Components

**User Story:** As a developer, I want reusable UI components built with Tamagui, so that the app maintains consistent styling and is maintainable.

#### Acceptance Criteria

1. THE FoodTracker SHALL implement all UI components using the Tamagui component library.
2. THE FoodTracker SHALL use TypeScript for all frontend code with strict type checking enabled.
3. THE FoodTracker SHALL organize reusable components in a dedicated components directory.
4. THE FoodTracker SHALL implement responsive layouts that adapt to different screen sizes.
