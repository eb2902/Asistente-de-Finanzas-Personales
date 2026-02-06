# Intelligent Categorization Engine - Test Guide

## Backend API Tests

### 1. Transaction Categorization Endpoint

**Endpoint:** `POST /api/transactions/categorize`

**Test Cases:**

```bash
# Test food categorization
curl -X POST http://localhost:3001/api/transactions/categorize \
  -H "Content-Type: application/json" \
  -d '{"description": "Compra en supermercado Jumbo"}'

# Expected response:
{
  "success": true,
  "data": {
    "category": "Alimentos",
    "confidence": 0.9,
    "explanation": "Coincidencia por palabra clave: Alimentos"
  }
}

# Test transportation categorization
curl -X POST http://localhost:3001/api/transactions/categorize \
  -H "Content-Type: application/json" \
  -d '{"description": "Pasaje de colectivo 60"}'

# Test service categorization
curl -X POST http://localhost:3001/api/transactions/categorize \
  -H "Content-Type: application/json" \
  -d '{"description": "Factura de luz EDESUR"}'
```

### 2. Transaction Management Endpoints

**Create Transaction:**
```bash
# First, authenticate to get JWT token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Then create a transaction with AI categorization
curl -X POST http://localhost:3001/api/transactions \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Almuerzo en restaurante Italiano",
    "amount": 2500,
    "type": "expense"
  }'
```

## Frontend Compound Interest Calculator Tests

### Test the Compound Interest Hook

```typescript
// In a test file or component
import { useCompoundInterest } from '../hooks/useCompoundInterest';

function TestCompoundInterest() {
  const {
    inputs,
    results,
    error,
    isLoading,
    calculate,
    reset,
    updateInput
  } = useCompoundInterest();

  // Test basic calculation
  const testCalculation = () => {
    calculate({
      principal: 1000,
      annualRate: 0.05,
      compoundFrequency: 12,
      timeYears: 10
    });
  };

  // Test with contributions
  const testWithContributions = () => {
    calculate({
      principal: 1000,
      annualRate: 0.05,
      compoundFrequency: 12,
      timeYears: 10,
      regularContribution: 100
    });
  };

  return (
    <div>
      <button onClick={testCalculation}>Test Basic Calculation</button>
      <button onClick={testWithContributions}>Test With Contributions</button>
      <button onClick={reset}>Reset</button>
      
      {isLoading && <p>Calculating...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
      
      {results && (
        <div>
          <h3>Results:</h3>
          <p>Final Amount: ${results.finalAmount}</p>
          <p>Total Interest: ${results.totalInterest}</p>
          <p>Effective Annual Rate: {(results.effectiveAnnualRate * 100).toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
}
```

## Environment Validation Tests

### Test Missing Environment Variables

1. **Remove OPENAI_API_KEY from .env and restart server**
   - Server should fail to start with error message
   - Console should show: "Missing required environment variables: OPENAI_API_KEY"

2. **Invalid JWT_SECRET (too short)**
   - Set JWT_SECRET to something less than 32 characters
   - Server should fail to start with validation error

3. **Invalid OPENAI_API_KEY format**
   - Set OPENAI_API_KEY to something that doesn't start with "sk-"
   - Server should fail to start with format error

## Database Schema Verification

### Check Transactions Table

After running the application, verify the database schema:

```sql
-- Check if transactions table exists
SELECT * FROM information_schema.tables WHERE table_name = 'transactions';

-- Check table structure
\d transactions;

-- Verify AI fields exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
AND column_name IN ('category', 'confidence');
```

## Integration Test Flow

1. **Setup Environment:**
   - Create `.env` file with all required variables
   - Ensure OpenAI API key is valid
   - Start PostgreSQL database

2. **Start Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Test API Endpoints:**
   - Test categorization endpoint
   - Test transaction creation with AI categorization
   - Verify category and confidence fields are populated

4. **Start Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Test Frontend Components:**
   - Test compound interest calculator
   - Verify all calculations work correctly
   - Test error handling

## Expected Results

### Backend
- ✅ AI categorization returns appropriate categories
- ✅ Confidence scores are between 0 and 1
- ✅ Transactions are saved with AI-generated categories
- ✅ Environment validation prevents startup with missing variables
- ✅ Pre-commit hook prevents .env files from being committed

### Frontend
- ✅ Compound interest calculations are accurate
- ✅ Error handling works for invalid inputs
- ✅ Projection data is generated correctly
- ✅ Hook provides proper state management

### Security
- ✅ Environment variables are properly validated
- ✅ Sensitive data is not exposed in responses
- ✅ Database schema includes AI categorization fields
- ✅ Pre-commit hooks prevent accidental credential leaks