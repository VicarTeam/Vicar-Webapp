using System;
using System.IO;
using LibGit2Sharp;

namespace Vicar.Data;

/// <summary>
/// The data updater is used for updating the local data to fit the remote data in the public repository of Vicar. 
/// </summary>
public static class DataUpdater
{
    /// <summary>
    /// The event gets called when the <see cref="UpdateState"/> of the data updater changed.
    /// </summary>
    public static event Action<UpdateState> StateChanged;
    
    /// <summary>
    /// The url to the public data repository.
    /// </summary>
    private const string RepositoryUrl = "https://github.com/VicarTeam/VtM-Data.git";

    /// <summary>
    /// Starts the updating process.
    /// </summary>
    public static void Start()
    {
        StateChanged?.Invoke(UpdateState.Loading);

        var path = GetPath();

        if (Directory.Exists(path) && Repository.IsValid(path))
        {
            StateChanged?.Invoke(UpdateState.Updating);
            
            using var repo = new Repository(path);
            repo.Reset(ResetMode.Hard);
            
            Commands.Pull(repo, new Signature("VicarTeam", "VicarTeam@placeholder.com", DateTimeOffset.Now), null);

            StateChanged?.Invoke(UpdateState.Finished);
            return;
        }

        if (Directory.Exists(path))
        {
            Directory.Delete(path);
        }

        StateChanged?.Invoke(UpdateState.Updating);

        var repoPath = Repository.Clone(RepositoryUrl, path);
        Directory.Move(repoPath, path);
        
        StateChanged?.Invoke(UpdateState.Finished);
    }
    
    /// <summary>
    /// Returns the path to the data directory.
    /// </summary>
    public static string GetPath()
    {
        var path = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "vicar");
        Directory.CreateDirectory(path);
        return Path.Combine(path, "data");
    }
}