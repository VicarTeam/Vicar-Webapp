using System;
using System.Drawing;
using System.IO;
using System.Security.Cryptography.X509Certificates;
using System.Windows.Forms;
using CefSharp;
using CefSharp.WinForms;
using Vicar.Controller;

namespace Vicar;

public partial class MainForm : Form
{
    internal ChromiumWebBrowser Browser { get; }
    
    public MainForm()
    {
        InitializeComponent();
        
        Size = new Size(1280, 720);
#if DEBUG
        string addr = Path.Combine(Directory.GetParent(Directory.GetCurrentDirectory())!.Parent!.Parent!.FullName, "Vicar.UI", "dist", "index.html");
#else
        string addr = Path.Combine(Application.StartupPath, "frontend", "index.html");
#endif
        Browser = new ChromiumWebBrowser
        {
            Dock = DockStyle.Fill,
            RequestHandler = new InterfaceRequestHandler()
        };
        Browser.MenuHandler = new HiddenMenuHandler();
        Browser.JavascriptObjectRepository.Register("backend", new BackendController(), false);
        Browser.FrameLoadEnd += (_, args) =>
        {
            if (args.Frame.IsMain)
            {
#if DEBUG
                Browser.ShowDevTools();
#endif
            }
        };
        Browser.Load(addr);
        Controls.Add(Browser);
    }
    
    internal void SafeInvoke(Action action)
    {
        Invoke(action);
    }
    
    internal class HiddenMenuHandler : IContextMenuHandler
    {
        public void OnBeforeContextMenu(IWebBrowser chromiumWebBrowser, IBrowser browser, IFrame frame, IContextMenuParams parameters,
            IMenuModel model)
        {

        }

        public bool OnContextMenuCommand(IWebBrowser chromiumWebBrowser, IBrowser browser, IFrame frame, IContextMenuParams parameters,
            CefMenuCommand commandId, CefEventFlags eventFlags)
        {
            return true;
        }

        public void OnContextMenuDismissed(IWebBrowser chromiumWebBrowser, IBrowser browser, IFrame frame)
        {
        }

        public bool RunContextMenu(IWebBrowser chromiumWebBrowser, IBrowser browser, IFrame frame, IContextMenuParams parameters,
            IMenuModel model, IRunContextMenuCallback callback)
        {
            return true;
        }
    }
    
    private class InterfaceRequestHandler : IRequestHandler
    {
        public bool OnBeforeBrowse(IWebBrowser chromiumWebBrowser, IBrowser browser, IFrame frame, IRequest request,
            bool userGesture,
            bool isRedirect)
        {
            return false;
        }

        public void OnDocumentAvailableInMainFrame(IWebBrowser chromiumWebBrowser, IBrowser browser)
        {
        }

        public bool OnOpenUrlFromTab(IWebBrowser chromiumWebBrowser, IBrowser browser, IFrame frame, string targetUrl,
            WindowOpenDisposition targetDisposition, bool userGesture)
        {
            return false;
        }

        public IResourceRequestHandler GetResourceRequestHandler(IWebBrowser chromiumWebBrowser, IBrowser browser,
            IFrame frame,
            IRequest request, bool isNavigation, bool isDownload, string requestInitiator,
            ref bool disableDefaultHandling)
        {
            return null;
        }

        public bool GetAuthCredentials(IWebBrowser chromiumWebBrowser, IBrowser browser, string originUrl, bool isProxy,
            string host,
            int port, string realm, string scheme, IAuthCallback callback)
        {
            callback.Dispose();
            return false;
        }

        public bool OnQuotaRequest(IWebBrowser chromiumWebBrowser, IBrowser browser, string originUrl, long newSize,
            IRequestCallback callback)
        {
            callback.Dispose();
            return false;
        }

        public bool OnCertificateError(IWebBrowser chromiumWebBrowser, IBrowser browser, CefErrorCode errorCode,
            string requestUrl,
            ISslInfo sslInfo, IRequestCallback callback)
        {
            callback.Dispose();
            return false;
        }

        public bool OnSelectClientCertificate(IWebBrowser chromiumWebBrowser, IBrowser browser, bool isProxy,
            string host, int port,
            X509Certificate2Collection certificates, ISelectClientCertificateCallback callback)
        {
            callback.Dispose();
            return false;
        }

        public void OnPluginCrashed(IWebBrowser chromiumWebBrowser, IBrowser browser, string pluginPath)
        {
        }

        public void OnRenderViewReady(IWebBrowser chromiumWebBrowser, IBrowser browser)
        {
        }

        public void OnRenderProcessTerminated(IWebBrowser chromiumWebBrowser, IBrowser browser,
            CefTerminationStatus status)
        {
        }
    }
}