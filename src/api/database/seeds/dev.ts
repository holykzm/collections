import { Output } from '../../../utilities/output.js';
import { createPost } from './createPost.js';
import { createProjects, jaProject, enProject } from './createProjects.js';
import { createRoles } from './createRoles.js';
import { createUsers } from './createUsers.js';

export const seedDev = async (): Promise<void> => {
  try {
    await createProjects();
    await createRoles();
    await createUsers();
    await createPost(enProject, {
      defaultLocale: 'en',
    });
    await createPost(jaProject, {
      defaultLocale: 'ja',
    });

    process.exit(0);
  } catch (e) {
    Output.error(e);
    process.exit(1);
  }
};
