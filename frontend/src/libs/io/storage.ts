//TODO: Implement storage for web

export class Storage {
  public static async writeStorage(name: string, value: string) {
    /*try {
      if (!this.isTauriApp()) {
        localStorage.setItem(name, value);
      } else {
        const path = await this.getBaseStoragePath();
        const fileName = await join(path, name + ".json");
        await writeTextFile(fileName, value);
      }
    } catch (e) {
      console.error(e);
    }*/
  }

  public static async readStorage(name: string): Promise<string|null> {
    /*try {
      if (!this.isTauriApp()) {
        return localStorage.getItem(name);
      }

      const path = await this.getBaseStoragePath();
      const fileName = await join(path, name + ".json");
      return await readTextFile(fileName);
    } catch (e) {
      console.error(e);
      return null;
    }*/
    return null;
  }

  public static async removeStorage(name: string) {
    /*try {
      if (!this.isTauriApp()) {
        localStorage.removeItem(name);
      } else {
        const path = await this.getBaseStoragePath();
        const fileName = await join(path, name + ".json");
        await removeFile(fileName);
      }
    } catch (e) {
      console.error(e);
    }*/
  }
}