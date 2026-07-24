import express from 'express';
import { getSettings } from './settings.js';
import { runCommand } from './run-command.js';
const router = express.Router();

router.get('/:id/checkpoints', (req, res) => {
  try {
    const settings = getSettings();
    const project = settings.projects.find(p => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });

    let out = '';
    try {
      out = runCommand('git', ['log', '--pretty=format:%h|%D|%s|%ar|%an'], project.path);
    } catch (e) {
      out = '';
    }
    if (!out.trim()) return res.json([]);

    const checkpoints = out.trim().split('\n')
      .map(line => {
        const [hash, refs, message, timeAgo, author] = line.trim().split('|');
        const tagMatch = refs ? refs.match(/tag: (aicp\/[0-9]+\.[0-9]+-[0-9]+)/) : null;
        if (tagMatch) {
          return { hash: tagMatch[1], message, timeAgo, author };
        }
        return null;
      })
      .filter(Boolean);
      
    res.json(checkpoints);
  } catch (e) {
    res.json([]);
  }
});

router.post('/:id/rollback', (req, res) => {
  const settings = getSettings();
  const project = settings.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });

  const { hash } = req.body;
  if (!hash) return res.status(400).json({ error: 'Hash required' });
  if (!/^aicp\/[0-9]+\.[0-9]+-[0-9]+$/.test(hash)) return res.status(400).json({ error: 'Invalid tag format' });

  try {
    runCommand('./l', ['cp', 'back', '--force', hash], project.path);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
