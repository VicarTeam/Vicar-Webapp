// ReSharper disable InconsistentNaming

using System.IO;
using CefSharp;
using Newtonsoft.Json;
using Vicar.Data;

namespace Vicar.Controller;

internal class BackendController
{
    public void getPaths(IJavascriptCallback callback)
    {
        callback.ExecuteAsync(DataUpdater.GetPath(), Program.GetCharsPath());
    }
    
    public void updateData(IJavascriptCallback callback)
    {
        try
        {
            DataUpdater.StateChanged += state => callback.ExecuteAsync((int) state);
            
            DataUpdater.Start();
        }
        catch
        {
            callback.ExecuteAsync(null);
        }
    }

    public void joinPath(string paths, IJavascriptCallback callback)
    {
        try
        {
            callback.ExecuteAsync(Path.Combine(JsonConvert.DeserializeObject<string[]>(paths)));
        }
        catch
        {
            callback.ExecuteAsync(null);
        }
    }

    public void getFolders(string path, IJavascriptCallback callback)
    {
        try
        {
            callback.ExecuteAsync(JsonConvert.SerializeObject(Directory.GetDirectories(path)));
        }
        catch
        {
            callback.ExecuteAsync(null);
        }
    }

    public void existsFile(string path, IJavascriptCallback callback)
    {
        try
        {
            callback.ExecuteAsync(File.Exists(path));
        }
        catch
        {
            callback.ExecuteAsync(false);
        }
    }
    
    public void saveFile(string path, string content, IJavascriptCallback callback)
    {
        try
        {
            File.WriteAllText(path, content);
            callback.ExecuteAsync(true);
        }
        catch
        {
            callback.ExecuteAsync(false);
        }
    }

    public void readFile(string path, IJavascriptCallback callback)
    {
        try
        {
            callback.ExecuteAsync(File.ReadAllText(path));
        }
        catch
        {
            callback.ExecuteAsync(null);
        }
    }

    public void isPackaged(IJavascriptCallback callback)
    {
#if DEBUG
        callback.ExecuteAsync(false);
#else
        callback.ExecuteAsync(true);
#endif
    }
}