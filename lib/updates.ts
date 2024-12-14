import { relaunch } from '@tauri-apps/plugin-process';
import { check } from '@tauri-apps/plugin-updater';

export type UpdateStatus = {
  available: boolean;
  version?: string;
  notes?: string;
};

export async function checkForUpdates(): Promise<UpdateStatus> {
  try {
    const update = await check();
    if (update) {
      console.log(
        `found update ${update.version} from ${update.date} with notes ${update.body}`
      );
      let downloaded = 0;
      let contentLength = 0;
      
      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            contentLength = event.data.contentLength ?? 0;
            console.log(`started downloading ${event.data.contentLength} bytes`);
            break;
          case 'Progress':
            downloaded += event.data.chunkLength;
            console.log(`downloaded ${downloaded} from ${contentLength}`);
            break;
          case 'Finished':
            console.log('download finished');
            break;
        }
      });
    
      console.log('update installed');
      await relaunch();
      
      return {
        available: true,
        version: update.version,
        notes: update.body
      };
    }
    
    return { available: false };
  } catch (error) {
    console.error('Error checking for updates:', error);
    return { available: false };
  }
}