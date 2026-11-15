import { getProperty, propertyIsVisible } from '../store.js';
import { freshSession } from '../access.js';

/** Shared HTTP guard; importing it must not initialize another domain router. */
export async function visibleProject(req, res) {
  const session = (await freshSession(req.session)) ?? { sub: req.session.sub, role: 'none' };
  const project = await getProperty(req.params.id);
  if (!project || !propertyIsVisible(project, session)) {
    res.status(404).json({ error: 'That project does not exist.' });
    return null;
  }
  return project;
}
