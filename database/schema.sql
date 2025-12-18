-- Playwright Test Results Database Schema
-- Supports PostgreSQL and MySQL (with minor adjustments)

-- Test Runs Table
CREATE TABLE IF NOT EXISTS test_runs (
    id SERIAL PRIMARY KEY,
    run_id VARCHAR(255) UNIQUE NOT NULL,
    project_name VARCHAR(255),
    branch_name VARCHAR(255),
    commit_sha VARCHAR(255),
    ci_provider VARCHAR(100),
    ci_build_id VARCHAR(255),
    environment VARCHAR(100),
    started_at TIMESTAMP NOT NULL,
    finished_at TIMESTAMP,
    duration_ms INTEGER,
    status VARCHAR(50),
    total_tests INTEGER DEFAULT 0,
    passed_tests INTEGER DEFAULT 0,
    failed_tests INTEGER DEFAULT 0,
    skipped_tests INTEGER DEFAULT 0,
    flaky_tests INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_run_id (run_id),
    INDEX idx_started_at (started_at),
    INDEX idx_branch (branch_name),
    INDEX idx_status (status)
);

-- Test Cases Table
CREATE TABLE IF NOT EXISTS test_cases (
    id SERIAL PRIMARY KEY,
    test_id VARCHAR(255) NOT NULL,
    title TEXT NOT NULL,
    file_path VARCHAR(500),
    project_name VARCHAR(255),
    browser VARCHAR(100),
    test_type VARCHAR(100),
    tags TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_test (test_id, file_path, project_name, browser),
    INDEX idx_test_id (test_id),
    INDEX idx_file_path (file_path),
    INDEX idx_test_type (test_type)
);

-- Test Results Table
CREATE TABLE IF NOT EXISTS test_results (
    id SERIAL PRIMARY KEY,
    run_id VARCHAR(255) NOT NULL,
    test_case_id INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    duration_ms INTEGER,
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    error_stack TEXT,
    stdout TEXT,
    stderr TEXT,
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_case_id) REFERENCES test_cases(id) ON DELETE CASCADE,
    INDEX idx_run_id (run_id),
    INDEX idx_test_case_id (test_case_id),
    INDEX idx_status (status),
    INDEX idx_started_at (started_at)
);

-- Test Attachments Table
CREATE TABLE IF NOT EXISTS test_attachments (
    id SERIAL PRIMARY KEY,
    test_result_id INTEGER NOT NULL,
    name VARCHAR(255),
    content_type VARCHAR(100),
    path VARCHAR(500),
    body BYTEA,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_result_id) REFERENCES test_results(id) ON DELETE CASCADE,
    INDEX idx_test_result_id (test_result_id)
);

-- Test Metrics Table (for performance tests)
CREATE TABLE IF NOT EXISTS test_metrics (
    id SERIAL PRIMARY KEY,
    test_result_id INTEGER NOT NULL,
    metric_name VARCHAR(255) NOT NULL,
    metric_value FLOAT,
    metric_unit VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_result_id) REFERENCES test_results(id) ON DELETE CASCADE,
    INDEX idx_test_result_id (test_result_id),
    INDEX idx_metric_name (metric_name)
);

-- Flaky Tests Tracking
CREATE TABLE IF NOT EXISTS flaky_tests (
    id SERIAL PRIMARY KEY,
    test_case_id INTEGER NOT NULL,
    first_detected TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_detected TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    occurrences INTEGER DEFAULT 1,
    pass_count INTEGER DEFAULT 0,
    fail_count INTEGER DEFAULT 0,
    flake_rate FLOAT,
    FOREIGN KEY (test_case_id) REFERENCES test_cases(id) ON DELETE CASCADE,
    INDEX idx_test_case_id (test_case_id),
    INDEX idx_flake_rate (flake_rate)
);

-- Views for Common Queries

-- Test Pass/Fail Rate Over Time
CREATE OR REPLACE VIEW test_pass_rate_daily AS
SELECT
    DATE(started_at) as test_date,
    COUNT(*) as total_runs,
    SUM(passed_tests) as total_passed,
    SUM(failed_tests) as total_failed,
    ROUND(100.0 * SUM(passed_tests) / NULLIF(SUM(total_tests), 0), 2) as pass_rate
FROM test_runs
WHERE status = 'completed'
GROUP BY DATE(started_at)
ORDER BY test_date DESC;

-- Slowest Tests
CREATE OR REPLACE VIEW slowest_tests AS
SELECT
    tc.test_id,
    tc.title,
    tc.file_path,
    AVG(tr.duration_ms) as avg_duration_ms,
    MAX(tr.duration_ms) as max_duration_ms,
    MIN(tr.duration_ms) as min_duration_ms,
    COUNT(*) as execution_count
FROM test_results tr
JOIN test_cases tc ON tr.test_case_id = tc.id
WHERE tr.status = 'passed'
GROUP BY tc.test_id, tc.title, tc.file_path
ORDER BY avg_duration_ms DESC
LIMIT 50;

-- Most Flaky Tests
CREATE OR REPLACE VIEW most_flaky_tests AS
SELECT
    tc.test_id,
    tc.title,
    tc.file_path,
    ft.occurrences,
    ft.pass_count,
    ft.fail_count,
    ft.flake_rate,
    ft.last_detected
FROM flaky_tests ft
JOIN test_cases tc ON ft.test_case_id = tc.id
ORDER BY ft.flake_rate DESC, ft.occurrences DESC
LIMIT 50;

-- Test Execution Trends (Last 30 Days)
CREATE OR REPLACE VIEW test_trends_30d AS
SELECT
    DATE(tr.started_at) as test_date,
    tc.test_type,
    COUNT(*) as executions,
    SUM(CASE WHEN tr.status = 'passed' THEN 1 ELSE 0 END) as passed,
    SUM(CASE WHEN tr.status = 'failed' THEN 1 ELSE 0 END) as failed,
    AVG(tr.duration_ms) as avg_duration_ms
FROM test_results tr
JOIN test_cases tc ON tr.test_case_id = tc.id
WHERE tr.started_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(tr.started_at), tc.test_type
ORDER BY test_date DESC, tc.test_type;

-- Functions for Flakiness Detection
DELIMITER $$

CREATE OR REPLACE FUNCTION update_flaky_tests()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if test has both passes and fails in recent runs
    WITH test_history AS (
        SELECT
            NEW.test_case_id,
            COUNT(*) as total_runs,
            SUM(CASE WHEN status = 'passed' THEN 1 ELSE 0 END) as passes,
            SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as fails
        FROM test_results
        WHERE test_case_id = NEW.test_case_id
          AND started_at >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY test_case_id
    )
    INSERT INTO flaky_tests (test_case_id, pass_count, fail_count, flake_rate, last_detected)
    SELECT
        test_case_id,
        passes,
        fails,
        ROUND(100.0 * LEAST(passes, fails) / NULLIF(total_runs, 0), 2),
        CURRENT_TIMESTAMP
    FROM test_history
    WHERE passes > 0 AND fails > 0
    ON CONFLICT (test_case_id)
    DO UPDATE SET
        occurrences = flaky_tests.occurrences + 1,
        pass_count = EXCLUDED.pass_count,
        fail_count = EXCLUDED.fail_count,
        flake_rate = EXCLUDED.flake_rate,
        last_detected = EXCLUDED.last_detected;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically detect flaky tests
CREATE TRIGGER detect_flaky_tests
AFTER INSERT ON test_results
FOR EACH ROW
EXECUTE FUNCTION update_flaky_tests();

DELIMITER ;

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_test_results_composite ON test_results(test_case_id, status, started_at);
CREATE INDEX IF NOT EXISTS idx_test_runs_composite ON test_runs(project_name, branch_name, started_at);
CREATE INDEX IF NOT EXISTS idx_test_cases_composite ON test_cases(file_path, test_type, browser);

-- Comments for Documentation
COMMENT ON TABLE test_runs IS 'Stores information about test suite executions';
COMMENT ON TABLE test_cases IS 'Stores unique test case definitions';
COMMENT ON TABLE test_results IS 'Stores individual test execution results';
COMMENT ON TABLE test_attachments IS 'Stores screenshots, videos, and other test artifacts';
COMMENT ON TABLE test_metrics IS 'Stores performance metrics from tests';
COMMENT ON TABLE flaky_tests IS 'Tracks tests that show inconsistent behavior';
