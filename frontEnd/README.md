# Frontend Integration Guide for New Backend

This guide outlines the necessary changes to integrate the Vue.js frontend with the new Express.js/Prisma backend.

## Summary of Changes

1. **API Configuration**

   - Updated base URL to match new backend (`http://localhost:5000/api`)
   - Modified authorization header format to use `Bearer` token scheme
   - Adjusted response processing to match new API structure

2. **Authentication Services**

   - Updated auth service to work with new JWT token mechanism
   - Added refresh token support
   - Modified user data mapping to handle role-based permissions
   - Updated login, register, and user info endpoints

3. **Data Services**

   - Updated drug service to match new endpoints and data structure
   - Updated order service to handle nested order data
   - Added mapping functions to convert between backend and frontend data formats

4. **Vuex Store Updates**

   - Modified all store modules to work with new response formats
   - Updated auth store to handle refresh tokens
   - Updated drug store to handle UUID-based identifiers
   - Updated order store to process nested order data

5. **Route Protection**

   - Implemented improved authentication guards
   - Added role-based access control for admin routes
   - Created utility for mapping roles to permission levels

6. **Other Improvements**
   - Added notification service for better user feedback
   - Enhanced error handling for API responses

## Implementation Steps

### 1. Update Service Files

Replace the following service files with their updated versions:

- `services/api.js`
- `services/auth.service.js`
- `services/drug.service.js`
- `services/order.service.js`

### 2. Update Store Modules

Replace the following Vuex store modules:

- `store/modules/auth.js`
- `store/modules/drugs.js`
- `store/modules/orders.js`

### 3. Update Route Guards

- Create `router/authguard.js` with the updated authentication guards
- Update `router/index.js` to use the new guards

### 4. Add Utilities

- Create `utils/notification.js` for displaying notifications

### 5. Component Adjustments

The following components may need minor adjustments to work with the updated data structures:

- Review `components/DrugItem.vue` to ensure it handles the `idDrug` property correctly
- Check `components/OrderHistory.vue` for compatibility with the new order structure
- Update any components that directly access order items

### 6. Data Field Mapping

Pay attention to these key field name changes:

| Old API                  | New API                                                     |
| ------------------------ | ----------------------------------------------------------- |
| `id` in drugs            | `idDrug` (frontend) / `id` (backend)                        |
| `name`/`surname`         | `firstName`/`lastName`                                      |
| numeric permission (0-3) | role string (`CUSTOMER`, `EMPLOYEE`, `PHARMACIST`, `ADMIN`) |
| `purchase_date`          | `orderDate`                                                 |
| `purchase_amount`        | `quantity`                                                  |
| nested order items       | accessible via `orderItems` array                           |

## Testing

After implementing these changes, test the following flows:

1. **Authentication**

   - User registration
   - User login
   - Access token refresh
   - Protected route access

2. **Drug Management**

   - Listing drugs with pagination
   - Drug details view
   - Adding/updating/deleting drugs (admin only)

3. **Order Management**

   - Creating orders
   - Viewing order history
   - Viewing order reports (admin only)
   - Updating order status (admin only)

4. **Admin Functions**
   - Admin panel access control
   - Revenue statistics

## Troubleshooting

- Check browser console for API errors
- Verify token format in localStorage
- Use the network tab to inspect API requests and responses
- Add temporary console.log statements in service files to debug data transformations
