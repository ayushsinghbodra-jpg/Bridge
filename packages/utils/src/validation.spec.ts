import {describe,expect,it} from '@jest/globals';
import {validateEmail, validateUsername, validatePassword, validateServerName, validateChannelName, isValidUrl} from './validation';
describe('Validation Functions', ()=>{
    describe('validateEmail', ()=>{
        it('should return true for valid email addresses', ()=>{
            expect(validateEmail('test@example.com')).toBe(true);
        });
    });
    describe('validateUsername', ()=>{
        it('should return true for valid usernames', ()=>{
            expect(validateUsername('testuser')).toBe(true);
        });
    });
    describe('validatePassword', ()=>{
        it('should return true for valid passwords with letters and numbers', ()=>{
            expect(validatePassword('testpassword1')).toBe(true);
        });
        it('should return false for passwords without numbers', ()=>{
            expect(validatePassword('testpassword')).toBe(false);
        });
    });
    describe('validateServerName', ()=>{
        it('should return true for valid server names', ()=>{
            expect(validateServerName('testserver')).toBe(true);
        });
    });
    describe('validateChannelName', ()=>{
        it('should return true for valid channel names', ()=>{
            expect(validateChannelName('testchannel')).toBe(true);
        });
    });
    describe('isValidUrl', ()=>{
        it('should return true for valid URLs', ()=>{
            expect(isValidUrl('https://example.com')).toBe(true);
        });
    });    
});