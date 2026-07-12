import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../../src/utils/logger';

describe('Logger Utility', () => {
  beforeEach(() => {
    // Spy on console methods and prevent them from actually logging to the console during tests
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    
    // Mock the Date object to have a consistent timestamp for testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-12T12:00:00.000Z'));
  });

  afterEach(() => {
    // Restore original console methods and timers
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should format and log an INFO message correctly', () => {
    const testMessage = 'User successfully logged in';
    
    logger.info(testMessage);
    
    // Verify console.info was called exactly once
    expect(console.info).toHaveBeenCalledTimes(1);
    
    // Verify the exact string that was passed to console.info
    expect(console.info).toHaveBeenCalledWith(
      '[2026-07-12T12:00:00.000Z] [INFO] Frontend - User successfully logged in'
    );
  });

  it('should format and log a WARN message correctly', () => {
    const testMessage = 'API limit approaching';
    
    logger.warn(testMessage);
    
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      '[2026-07-12T12:00:00.000Z] [WARN] Frontend - API limit approaching'
    );
  });

  it('should format and log an ERROR message correctly with optional parameters', () => {
    const testMessage = 'Failed to fetch data';
    const errorObj = { status: 500 };
    
    logger.error(testMessage, errorObj);
    
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(
      '[2026-07-12T12:00:00.000Z] [ERROR] Frontend - Failed to fetch data',
      errorObj
    );
  });

  it('should format and log a DEBUG message correctly', () => {
    const testMessage = 'Component re-rendered';
    
    logger.debug(testMessage);
    
    expect(console.debug).toHaveBeenCalledTimes(1);
    expect(console.debug).toHaveBeenCalledWith(
      '[2026-07-12T12:00:00.000Z] [DEBUG] Frontend - Component re-rendered'
    );
  });
});
