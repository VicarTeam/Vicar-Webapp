using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;
using CefSharp;
using CefSharp.WinForms;

namespace Vicar;

internal static class Program
{
    internal static MainForm Form { get; private set; }
    
    /// <summary>
    /// The main entry point for the application.
    /// </summary>
    [STAThread]
    private static void Main()
    {
        Cef.EnableHighDPISupport();
        var settings = new CefSettings
        {
            CachePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "CefSharp", "Cache"),
        };
        settings.CefCommandLineArgs.Add("enable-media-stream");
        settings.CefCommandLineArgs.Add("use-fake-ui-for-media-stream");
        settings.CefCommandLineArgs.Add("enable-usermedia-screen-capturing");
        settings.CefCommandLineArgs.Add("disable-web-security", "true");
        Cef.Initialize(settings, true, browserProcessHandler: null);
        
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        Application.Run(Form = new MainForm());
    }
    
    /// <summary>
    /// Returns the path where the characters are stored.
    /// </summary>
    internal static string GetCharsPath()
    {
        var path = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "vicar", "chars");
        Directory.CreateDirectory(path);
        return path;
    }
}