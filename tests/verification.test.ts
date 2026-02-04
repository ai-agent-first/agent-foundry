
import { describe, it, expect } from 'vitest';
import { SKILL_LIBRARY } from '../src/constants';
import { OllamaProvider } from '../src/services/providers/OllamaProvider';

describe('System Integrity Verification', () => {
    it('should have the correct number of skills', () => {
        // We added: Deep Reasoning, Code Expert, Data Engineer, Financial, Compliance, Creative, Communication, Security
        // Total should be >= 8
        expect(SKILL_LIBRARY.length).toBeGreaterThanOrEqual(8);
    });

    it('should have Critical SOPs defined for key skills', () => {
        const commSkill = SKILL_LIBRARY.find(s => s.id === 'email_drafter');
        expect(commSkill).toBeDefined();
        expect(commSkill?.instruction).toContain('Draft');

        const secSkill = SKILL_LIBRARY.find(s => s.id === 'security_login');
        expect(secSkill).toBeDefined();
        expect(secSkill?.instruction).toContain('Security Check');
    });

    it('should have the "Communication Specialist" skill bundled with email tools', () => {
        const commSkill = SKILL_LIBRARY.find(s => s.id === 'email_drafter');
        expect(commSkill?.bundledTools).toContain('email.send');
    });
});
