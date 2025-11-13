# Design Document - Codebase Audit & Optimization

## Overview

Tài liệu này mô tả thiết kế chi tiết cho việc thực hiện audit toàn diện codebase của dự án ToyStore. Audit sẽ được thực hiện thông qua các công cụ phân tích tự động và kiểm tra thủ công để phát hiện các vấn đề về bảo mật, chất lượng code, performance và kiến trúc.

## Architecture

### 1. Audit Framework

Audit sẽ được thực hiện theo mô hình phân tầng:

```
┌─────────────────────────────────────────┐
│     Audit Report Generator              │
│  (Tổng hợp và tạo báo cáo cuối cùng)   │
└─────────────────────────────────────────┘
                    ↑
┌─────────────────────────────────────────┐
│        Analysis Aggregator              │
│   (Thu thập kết quả từ các analyzer)   │
└─────────────────────────────────────────┘
                    ↑
┌──────────┬──────────┬──────────┬────────┐
│ Security │  Code    │  Dead    │ Perf   │
│ Analyzer │ Quality  │  Code    │Analyzer│
│          │ Analyzer │ Detector │        │
└──────────┴──────────┴──────────┴────────┘
                    ↑
┌─────────────────────────────────────────┐
│         Codebase Scanner                │
│    (Quét và parse source code)         │
└─────────────────────────────────────────┘
```

### 2. Phương pháp Audit

#### 2.1 Static Analysis
- Sử dụng regex patterns và AST parsing để phát hiện code smells
- Phân tích import/export để tìm dead code
- Kiểm tra hardcoded secrets thông qua pattern matching

#### 2.2 Dynamic Analysis
- Trace API calls từ frontend đến backend
- Phân tích database queries để tìm N+1 problems
- Kiểm tra transaction handling

#### 2.3 Manual Review
- Review design patterns implementation
- Kiểm tra business logic
- Đánh giá architecture decisions

## Components and Interfaces

### 1. Security Analyzer

**Chức năng:**
- Quét hardcoded secrets (passwords, API keys, tokens)
- Phát hiện SQL injection vulnerabilities
- Kiểm tra missing authentication/authorization
- Validate input validation
- Kiểm tra file upload security

**Input:**
- Source code files (*.js, *.jsx)
- Configuration files (.env, config/*.js)

**Output:**
```javascript
{
  category: 'security',
  severity: 'critical' | 'high' | 'medium' | 'low',
  issues: [
    {
      file: 'path/to/file.js',
      line: 123,
      type: 'hardcoded_secret' | 'sql_injection' | 'missing_auth' | ...,
      message: 'Mô tả chi tiết vấn đề',
      recommendation: 'Gợi ý sửa chữa'
    }
  ]
}
```

### 2. Code Quality Analyzer

**Chức năng:**
- Phát hiện code duplication
- Đo độ phức tạp của functions (cyclomatic complexity)
- Kiểm tra error handling patterns
- Validate logging practices (console.log vs Logger)
- Kiểm tra naming conventions

**Metrics:**
- Lines of code per function
- Number of parameters
- Nesting depth
- Code duplication percentage

### 3. Dead Code Detector

**Chức năng:**
- Phát hiện unused imports
- Tìm functions không được gọi
- Phát hiện unused variables
- Kiểm tra API endpoints không được sử dụng
- Tìm models không được reference

**Phương pháp:**
1. Build dependency graph từ imports/exports
2. Trace từ entry points (server.js, App.js)
3. Mark các nodes được reach
4. Report các nodes không được reach

### 4. Performance Analyzer

**Chức năng:**
- Phát hiện N+1 query problems
- Kiểm tra missing pagination
- Phát hiện nested loops
- Kiểm tra missing await keywords
- Validate transaction handling

**Focus Areas:**
- Database queries trong controllers
- Sequelize includes và associations
- Loop structures
- Async/await patterns

### 5. Architecture Reviewer

**Chức năng:**
- Validate design patterns (Singleton, Strategy, Decorator)
- Phát hiện circular dependencies
- Kiểm tra separation of concerns
- Validate error response consistency
- Kiểm tra configuration management

## Data Models

### Audit Result Schema

```javascript
{
  timestamp: Date,
  projectInfo: {
    name: 'ToyStore',
    version: '2.0.0',
    backend: {
      framework: 'Express.js',
      database: 'SQL Server',
      orm: 'Sequelize'
    },
    frontend: {
      framework: 'React',
      version: '18.2.0'
    }
  },
  summary: {
    totalIssues: Number,
    critical: Number,
    high: Number,
    medium: Number,
    low: Number,
    filesScanned: Number,
    linesOfCode: Number
  },
  categories: {
    security: SecurityAnalysisResult,
    codeQuality: CodeQualityResult,
    deadCode: DeadCodeResult,
    performance: PerformanceResult,
    architecture: ArchitectureResult,
    dependencies: DependencyResult,
    testing: TestingResult,
    documentation: DocumentationResult
  },
  recommendations: [
    {
      priority: 'critical' | 'high' | 'medium' | 'low',
      category: String,
      title: String,
      description: String,
      effort: 'low' | 'medium' | 'high',
      impact: 'low' | 'medium' | 'high'
    }
  ]
}
```

## Error Handling

### Audit Process Error Handling

1. **File Access Errors**
   - Gracefully skip files that cannot be read
   - Log warning và continue với files khác
   - Report missing files trong final report

2. **Parse Errors**
   - Catch syntax errors khi parse JavaScript
   - Report files có syntax errors
   - Continue audit với files còn lại

3. **Analysis Errors**
   - Wrap mỗi analyzer trong try-catch
   - Log errors nhưng không stop toàn bộ audit
   - Report analyzer failures trong summary

## Testing Strategy

### Unit Tests
- Test individual analyzers với sample code
- Test pattern matching cho security issues
- Test dependency graph building
- Test report generation

### Integration Tests
- Test full audit flow trên sample project
- Verify tất cả analyzers chạy successfully
- Validate report format và content

### Manual Validation
- Review một số findings manually
- Verify false positives
- Validate recommendations

## Implementation Phases

### Phase 1: Core Infrastructure
1. Setup audit framework structure
2. Implement codebase scanner
3. Create report generator
4. Build basic analyzers

### Phase 2: Security & Quality
1. Implement Security Analyzer
2. Implement Code Quality Analyzer
3. Add detailed reporting
4. Create recommendations engine

### Phase 3: Performance & Architecture
1. Implement Performance Analyzer
2. Implement Architecture Reviewer
3. Add dependency analysis
4. Enhance reporting

### Phase 4: Dead Code & Documentation
1. Implement Dead Code Detector
2. Add documentation audit
3. Add testing coverage analysis
4. Final report enhancements

## Known Findings (Preliminary Analysis)

### Security Issues Identified

1. **Hardcoded Credentials** (Low Priority)
   - File: `README.md` line 50
   - Issue: Example password trong documentation
   - Recommendation: Đây là documentation, không phải code thực tế

2. **Console.log Usage** (Medium Priority)
   - Multiple files sử dụng `console.log` thay vì Logger utility
   - Files: `server.js`, `FilterContext.js`, `upload.middleware.js`
   - Recommendation: Migrate sang Logger.getInstance()

### Code Quality Issues

1. **Inconsistent Logging**
   - Một số files dùng Logger, một số dùng console.log
   - Recommendation: Standardize logging across codebase

2. **Large Controller Files**
   - `cart.controller.js`: 1172 lines
   - `order.controller.js`: 2034 lines
   - Recommendation: Consider splitting into smaller modules

### Architecture Observations

1. **Design Patterns** (Positive)
   - ✅ Singleton pattern implemented correctly (Logger, ConfigService, DBConnection)
   - ✅ Strategy pattern used for product filtering
   - ✅ Decorator pattern used for order pricing

2. **Transaction Handling** (Positive)
   - ✅ Proper use of Sequelize transactions
   - ✅ Pessimistic locking for inventory management
   - ✅ Proper rollback on errors

3. **Rate Limiting** (Positive)
   - ✅ Rate limiters configured for different endpoints
   - ⚠️ Some limits seem high for testing (50 login attempts)

### Performance Considerations

1. **File Upload**
   - ✅ Proper file size limits (5MB)
   - ✅ File type validation
   - ✅ Proper error handling

2. **Database Queries**
   - Need to analyze for N+1 problems
   - Need to check pagination implementation

## Tools and Technologies

### Analysis Tools
- **AST Parser**: acorn or @babel/parser
- **Pattern Matching**: Regular expressions
- **Dependency Analysis**: madge or dependency-cruiser
- **Code Metrics**: escomplex

### Reporting
- **Format**: Markdown + JSON
- **Visualization**: Mermaid diagrams for architecture
- **Export**: HTML report với interactive features

## Deliverables

1. **Comprehensive Audit Report** (Markdown)
   - Executive summary
   - Detailed findings by category
   - Prioritized recommendations
   - Code examples và fixes

2. **JSON Data Export**
   - Machine-readable audit results
   - For integration với CI/CD

3. **Action Plan**
   - Prioritized list of fixes
   - Estimated effort for each
   - Dependencies between fixes

4. **Best Practices Guide**
   - Coding standards
   - Security guidelines
   - Performance tips
   - Architecture patterns

## Success Criteria

1. **Coverage**
   - ✅ 100% of source files scanned
   - ✅ All major categories analyzed
   - ✅ Both backend và frontend covered

2. **Accuracy**
   - ✅ Low false positive rate (<10%)
   - ✅ All critical issues identified
   - ✅ Actionable recommendations

3. **Usability**
   - ✅ Clear, understandable report
   - ✅ Prioritized findings
   - ✅ Specific fix recommendations
