# Intelligent Categorization Engine

## Overview

The Intelligent Categorization Engine is a comprehensive financial management system that combines AI-powered transaction categorization with advanced compound interest calculations. This system automatically classifies expenses and provides powerful savings goal planning tools.

## Features

### 🤖 AI-Powered Transaction Categorization
- **Smart Classification**: Automatically categorizes transactions using OpenAI's GPT-3.5-turbo
- **Fallback System**: Local keyword matching when AI is unavailable
- **Confidence Scoring**: Provides confidence levels for each categorization
- **Multi-language Support**: Spanish categories with international compatibility

### 📊 Compound Interest Calculator
- **Mathematical Precision**: Implements the formula A = P(1 + r/n)^(nt)
- **Flexible Contributions**: Supports regular contributions over time
- **Goal Planning**: Calculate required investments and time to reach goals
- **Inflation Adjustment**: Real vs nominal return calculations
- **Projection Visualization**: Generate detailed growth projections

### 🔒 Enhanced Security
- **Environment Validation**: Startup validation for all required variables
- **Pre-commit Hooks**: Prevents accidental credential commits
- **Input Validation**: Comprehensive validation for all API endpoints
- **Error Handling**: Graceful degradation with fallback mechanisms

## Architecture

### Backend (FastAPI/TypeScript)
```
backend/
├── src/
│   ├── models/
│   │   ├── User.ts          # User entity
│   │   └── Transaction.ts   # Transaction with AI fields
│   ├── services/
│   │   └── nlp.service.ts   # AI categorization service
│   ├── controllers/
│   │   └── transactions.controller.ts  # Transaction business logic
│   ├── routes/
│   │   └── transactions.routes.ts      # API endpoints
│   ├── middleware/
│   │   ├── auth.middleware.ts          # JWT authentication
│   │   └── env-validation.middleware.ts # Environment validation
│   └── utils/
└── config/
    └── database.ts          # Database configuration
```

### Frontend (Next.js/TypeScript)
```
frontend/
├── src/
│   ├── utils/
│   │   └── compoundInterest.ts  # Mathematical calculations
│   ├── hooks/
│   │   └── useCompoundInterest.ts  # React hook for calculations
│   ├── components/          # UI components
│   ├── pages/              # Application pages
│   └── services/           # API service calls
```

## Installation

### Prerequisites
- Node.js 18+
- PostgreSQL
- OpenAI API Key

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Transaction Management
- `POST /api/transactions` - Create transaction with AI categorization
- `GET /api/transactions` - Get user transactions
- `GET /api/transactions/stats` - Get transaction statistics
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Categorization
- `POST /api/transactions/categorize` - Categorize description without saving

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh

## Environment Variables

```bash
# Required
NODE_ENV=development
PORT=3001
JWT_SECRET=your_jwt_secret_key_here_change_in_production
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=postgresql://user:password@localhost:5432/database_name

# Optional
OPENAI_MODEL=gpt-3.5-turbo
BCRYPT_ROUNDS=12
```

## Database Schema

### Transactions Table
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(50),           -- AI-generated category
    confidence FLOAT,               -- AI confidence score (0-1)
    type VARCHAR(10) NOT NULL,      -- 'income' or 'expense'
    merchant VARCHAR(255),          -- Optional merchant name
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Usage Examples

### AI Categorization
```bash
curl -X POST http://localhost:3001/api/transactions/categorize \
  -H "Content-Type: application/json" \
  -d '{"description": "Compra en supermercado Jumbo"}'

# Response:
{
  "success": true,
  "data": {
    "category": "Alimentos",
    "confidence": 0.9,
    "explanation": "Coincidencia por palabra clave: Alimentos"
  }
}
```

### Compound Interest Calculation
```typescript
import { calculateCompoundInterest } from './utils/compoundInterest';

const result = calculateCompoundInterest(
  1000,    // Principal
  0.05,    // 5% annual rate
  12,      // Monthly compounding
  10       // 10 years
);

console.log(`Final amount: $${result}`); // Final amount: $1647.01
```

## Security Features

### Environment Validation
- Validates all required environment variables at startup
- Checks JWT secret length (minimum 32 characters)
- Validates OpenAI API key format
- Prevents server startup with invalid configuration

### Pre-commit Hooks
- Automatically prevents .env files from being committed
- Provides helpful error messages for developers
- Ensures credentials stay local

### Input Validation
- Comprehensive validation for all API inputs
- SQL injection prevention through TypeORM
- XSS protection through proper escaping

## Testing

### Backend Tests
```bash
# Test categorization endpoint
npm test

# Test with coverage
npm run test:coverage
```

### Frontend Tests
```bash
# Test compound interest calculations
npm test

# Test component integration
npm run test:integration
```

### Manual Testing
See `test-intelligent-categorization.md` for comprehensive manual testing procedures.

## Performance Considerations

### AI Categorization
- **Caching**: Implement Redis caching for frequent descriptions
- **Rate Limiting**: OpenAI API rate limiting handled automatically
- **Fallback**: Local keyword matching ensures availability

### Database Optimization
- **Indexes**: Proper indexing on userId and createdAt fields
- **Pagination**: Built-in pagination for transaction lists
- **Query Optimization**: Efficient queries for statistics

## Monitoring and Logging

### Application Logs
- Structured logging with Winston
- Error tracking and debugging information
- Performance metrics for AI calls

### Health Checks
- `/api/health` endpoint for monitoring
- Database connection status
- Environment validation status

## Deployment

### Docker
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Production Considerations
- Use production database (not local PostgreSQL)
- Set proper environment variables
- Configure SSL/TLS certificates
- Set up monitoring and alerting

## Troubleshooting

### Common Issues

1. **OpenAI API Errors**
   - Check API key validity
   - Verify rate limits
   - Check network connectivity

2. **Database Connection**
   - Verify PostgreSQL is running
   - Check connection string format
   - Ensure database exists

3. **Environment Variables**
   - Ensure all required variables are set
   - Check .env file permissions
   - Verify no typos in variable names

### Debug Mode
```bash
# Enable debug logging
DEBUG=app:* npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the test documentation

## Future Enhancements

- [ ] Machine Learning model training for better categorization
- [ ] Multi-currency support
- [ ] Advanced analytics and reporting
- [ ] Mobile application integration
- [ ] Budget planning tools
- [ ] Investment tracking