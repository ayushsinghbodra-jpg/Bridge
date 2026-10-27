import {describe,expect,it} from '@jest/globals';
import {formatDate, timeAgo} from './date';
describe('date utils',()=>{
    describe('formatDate',()=>{
        it('should format date correctly',()=>{
            expect(formatDate(new Date('2023-01-01T12:34:56'))).toBe('01/01/2023, 12:34:56 PM');
        })
    });
    describe('timeAgo',()=>{
        it('should return correct time ago for seconds',() =>{
            expect(timeAgo(new Date(Date.now() - 30 * 1000))).toBe('30 seconds ago');
        })
    });
});