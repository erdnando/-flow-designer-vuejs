# 🔍 SearXNG Setup Guide - Free Web Search for AI Frontend Generation

## **Overview**
SearXNG is a free, self-hosted metasearch engine that aggregates results from multiple search engines without API costs or limits.

## **Installation (Docker - Recommended)**

### **1. Quick Setup**
```bash
# Clone SearXNG
git clone https://github.com/searxng/searxng-docker.git
cd searxng-docker

# Generate secret key
sed -i "s|ultrasecretkey|$(openssl rand -hex 32)|g" searxng/settings.yml

# Start services
docker-compose up -d
```

### **2. Banking-Optimized Configuration**
```yaml
# searxng/settings.yml - Banking customizations
search:
  safe_search: 1
  autocomplete: "google"
  default_lang: "es-MX"
  
engines:
  - name: google
    engine: google
    categories: ['general', 'finance']
    weight: 1
    
  - name: bing
    engine: bing  
    categories: ['general', 'finance']
    weight: 0.8
    
  - name: github
    engine: github
    categories: ['code']
    weight: 1
    
  - name: stackoverflow
    engine: stackoverflow
    categories: ['code', 'it']
    weight: 0.9

# Banking-specific customizations
outgoing:
  request_timeout: 10.0
  max_request_timeout: 15.0
  useragent_suffix: "BankingAI/1.0"
```

### **3. Integration with Flow Designer**
```typescript
// src/services/search/searxng-client.ts
export class SearXNGClient {
  private baseUrl = 'http://localhost:8080'; // Your SearXNG instance
  
  async searchBankingCompliance(query: string): Promise<SearchResult[]> {
    const response = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: `${query} site:condusef.gob.mx OR site:cnbv.gob.mx OR site:banxico.org.mx`,
        categories: ['general'],
        engines: ['google', 'bing'],
        format: 'json',
        safesearch: 1
      })
    });
    
    return await response.json();
  }
  
  async searchAPIDocumentation(apiName: string): Promise<SearchResult[]> {
    const response = await fetch(`${this.baseUrl}/search`, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: `${apiName} API documentation banking mexico`,
        categories: ['general', 'code'],
        engines: ['google', 'github', 'stackoverflow'],
        format: 'json'
      })
    });
    
    return await response.json();
  }
  
  async searchBestPractices(topic: string): Promise<SearchResult[]> {
    const response = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: `${topic} banking UX best practices 2025`,
        categories: ['general'],
        engines: ['google', 'bing'],
        format: 'json',
        time_range: 'year' // Solo resultados recientes
      })
    });
    
    return await response.json();
  }
}
```

## **Cost Comparison**

### **Annual Costs**
```yaml
SearXNG_Setup:
  cost: $0
  searches: "unlimited"
  maintenance_hours: ~2/month
  
Serper.dev:
  free_tier: 2500/month
  starter_plan: $600/year (10k/month)
  
Google_Custom_Search:
  free_tier: 3000/month  
  paid: $150/year for our estimated usage
  
Hybrid_Approach:
  searxng: $0
  serper_premium_only: $200/year (critical searches)
  total: $200/year vs $600/year
```

## **Banking-Specific Search Strategies**

### **1. Compliance Research**
```typescript
const complianceQueries = {
  regulations: "CONDUSEF nuevas regulaciones {year}",
  pci_compliance: "PCI DSS banking requirements mexico update",
  data_protection: "LFPDPPP banking compliance {current_month}"
};
```

### **2. API Integration Research** 
```typescript
const apiQueries = {
  government: "INE API documentation mexico integration",
  credit_bureau: "Buró Crédito API nuevas funcionalidades",
  sms_providers: "SMS banking API mexico LADA providers"
};
```

### **3. UX/UI Best Practices**
```typescript
const uxQueries = {
  banking_flows: "banking onboarding UX best practices 2025",
  mobile_first: "mobile banking UI patterns mexico",
  accessibility: "banking accessibility WCAG compliance"
};
```

## **Performance Optimization**

### **Caching Strategy**
```typescript
// src/services/search/search-cache.ts
export class SearchCache {
  private redis = new Redis(process.env.REDIS_URL);
  
  async cachedSearch(query: string, ttl: number = 86400): Promise<SearchResult[]> {
    const cacheKey = `search:${md5(query)}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const results = await this.searxng.search(query);
    await this.redis.setex(cacheKey, ttl, JSON.stringify(results));
    
    return results;
  }
}
```

### **Rate Limiting**
```typescript
// Prevent overwhelming source engines
const rateLimiter = {
  max_concurrent: 3,
  delay_between_requests: 2000, // 2 seconds
  max_requests_per_minute: 20
};
```

## **Monitoring & Maintenance**

### **Health Checks**
```bash
# Check SearXNG status
curl http://localhost:8080/healthz

# Check engine status
curl http://localhost:8080/stats/checker
```

### **Log Monitoring**
```bash
# Monitor for engine failures
docker-compose logs -f searxng | grep "ERROR"

# Performance monitoring
docker stats searxng-docker_searxng_1
```

## **Migration from Serper.dev**

### **Step 1: Parallel Testing**
```typescript
// Test both services during development
const searchService = {
  async search(query: string) {
    const [searxngResults, serperResults] = await Promise.allSettled([
      searxng.search(query),
      serper.search(query)
    ]);
    
    // Compare results quality
    return this.selectBestResults(searxngResults, serperResults);
  }
};
```

### **Step 2: Gradual Migration**
```typescript
const migrationStrategy = {
  week1: "10% traffic to SearXNG",
  week2: "30% traffic to SearXNG", 
  week3: "70% traffic to SearXNG",
  week4: "100% traffic to SearXNG (keep Serper as fallback)"
};
```

---

## **✅ RECOMMENDATION**

**Use SearXNG as primary + Serper.dev as premium fallback**
- 95% of searches → SearXNG (free, unlimited)
- 5% critical searches → Serper.dev (compliance, official docs)
- **Annual savings**: ~$400-500
- **No search limits**: Perfect for development phase
