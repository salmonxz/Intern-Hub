using System;
using System.IO;
using System.Diagnostics;
using System.Drawing;
using System.Net;
using System.Threading;
using System.Windows.Forms;

namespace InternBPSLauncher
{
    static class Program
    {
        private static Process serverProcess = null;
        private static NotifyIcon trayIcon = null;
        private static ContextMenuStrip trayMenu = null;
        private static string projectRoot = null;
        private static Mutex singleInstanceMutex = null;
        private const string MutexName = "InternBPS_SingleInstance_Mutex_9742d7e9";
        private const string AppUrl = "http://localhost:3001";

        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            // 1. Single Instance Check
            bool createdNew;
            singleInstanceMutex = new Mutex(true, MutexName, out createdNew);
            if (!createdNew)
            {
                // App already running: open app window and exit this launcher
                OpenAppWindow();
                return;
            }

            // 2. Locate Project Root
            projectRoot = FindProjectRoot();
            if (string.IsNullOrEmpty(projectRoot))
            {
                MessageBox.Show(
                    "Direktori paket InternBPS tidak lengkap!\n\nPastikan Anda telah mengekstrak seluruh isi file ZIP secara utuh (folder server, dist, node_modules, bin, dll) dalam satu folder bersama InternBPS.exe sebelum membukanya.",
                    "InternBPS - Peringatan",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Warning
                );
                return;
            }

            // 3. Register Cleanup Handlers
            AppDomain.CurrentDomain.ProcessExit += OnProcessExit;
            Application.ApplicationExit += OnProcessExit;

            // 4. Setup System Tray Icon
            SetupTray();

            // 5. Start Server & Open App
            StartServerAndOpenApp();

            // 6. Run Windows Forms Message Loop
            Application.Run();
        }

        private static string FindProjectRoot()
        {
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            if (File.Exists(Path.Combine(baseDir, "server", "index.cjs")))
            {
                return baseDir;
            }

            string parentDir = Directory.GetParent(baseDir) != null ? Directory.GetParent(baseDir).FullName : null;
            if (parentDir != null && File.Exists(Path.Combine(parentDir, "server", "index.cjs")))
            {
                return parentDir;
            }

            string defaultWorkDir = @"c:\Users\ryeha\Intern Hub";
            if (File.Exists(Path.Combine(defaultWorkDir, "server", "index.cjs")))
            {
                return defaultWorkDir;
            }

            return null;
        }

        private static string FindNodeExecutable()
        {
            // 1. Check bundled node inside project or bin/ folder first
            if (!string.IsNullOrEmpty(projectRoot))
            {
                string localBin = Path.Combine(projectRoot, "bin", "node.exe");
                if (File.Exists(localBin)) return localBin;

                string localRoot = Path.Combine(projectRoot, "node.exe");
                if (File.Exists(localRoot)) return localRoot;
            }

            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string bundledBin = Path.Combine(baseDir, "bin", "node.exe");
            if (File.Exists(bundledBin)) return bundledBin;

            string bundledRoot = Path.Combine(baseDir, "node.exe");
            if (File.Exists(bundledRoot)) return bundledRoot;

            string[] searchPaths = new string[]
            {
                @"C:\Program Files\nodejs\node.exe",
                @"C:\laragon\bin\nodejs\node-v18\node.exe",
                @"C:\Program Files (x86)\nodejs\node.exe",
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Programs\node\node.exe")
            };

            foreach (string p in searchPaths)
            {
                if (File.Exists(p)) return p;
            }

            return "node";
        }

        private static bool IsServerRunning()
        {
            try
            {
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create(AppUrl + "/api/profile");
                req.Timeout = 1200;
                using (HttpWebResponse resp = (HttpWebResponse)req.GetResponse())
                {
                    return resp.StatusCode == HttpStatusCode.OK;
                }
            }
            catch
            {
                return false;
            }
        }

        private static void StartServerAndOpenApp()
        {
            ThreadPool.QueueUserWorkItem(delegate
            {
                try
                {
                    if (!IsServerRunning())
                    {
                        string nodePath = FindNodeExecutable();
                        string serverScript = Path.Combine(projectRoot, "server", "index.cjs");
                        string logPath = Path.Combine(projectRoot, "launcher", "server.log");

                        ProcessStartInfo psi = new ProcessStartInfo();
                        psi.FileName = nodePath;
                        psi.Arguments = "\"" + serverScript + "\"";
                        psi.WorkingDirectory = projectRoot;
                        psi.UseShellExecute = false;
                        psi.CreateNoWindow = true;
                        psi.WindowStyle = ProcessWindowStyle.Hidden;

                        serverProcess = Process.Start(psi);

                        // Wait for server to become ready (max 20s)
                        int retries = 0;
                        while (!IsServerRunning() && retries < 40)
                        {
                            Thread.Sleep(500);
                            retries++;
                        }
                    }

                    // Open Browser / App Window
                    OpenAppWindow();

                    if (trayIcon != null)
                    {
                        trayIcon.ShowBalloonTip(3000, "InternBPS Berjalan", "Aplikasi aktif di latar belakang (System Tray). Klik dua kali ikon untuk membuka kembali.", ToolTipIcon.Info);
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show(
                        "Gagal memulai server InternBPS:\n" + ex.Message,
                        "InternBPS - Kesalahan",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );
                }
            });
        }

        private static void OpenAppWindow()
        {
            string[] appBrowsers = new string[]
            {
                @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
                @"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
                @"C:\Program Files\Google\Chrome\Application\chrome.exe",
                @"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
            };

            foreach (string browser in appBrowsers)
            {
                if (File.Exists(browser))
                {
                    try
                    {
                        ProcessStartInfo psi = new ProcessStartInfo();
                        psi.FileName = browser;
                        psi.Arguments = "--app=\"" + AppUrl + "\" --window-size=1280,850";
                        psi.UseShellExecute = true;
                        Process.Start(psi);
                        return;
                    }
                    catch { }
                }
            }

            // Fallback: Default Browser
            try
            {
                Process.Start(AppUrl);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Gagal membuka browser: " + ex.Message);
            }
        }

        private static void SetupTray()
        {
            trayMenu = new ContextMenuStrip();
            
            ToolStripMenuItem itemOpen = new ToolStripMenuItem("Buka InternBPS", null, delegate {
                OpenAppWindow();
            });
            itemOpen.Font = new Font(itemOpen.Font, FontStyle.Bold);
            trayMenu.Items.Add(itemOpen);

            ToolStripMenuItem itemRestart = new ToolStripMenuItem("Restart Server", null, delegate {
                KillServerProcess();
                Thread.Sleep(500);
                StartServerAndOpenApp();
            });
            trayMenu.Items.Add(itemRestart);

            ToolStripMenuItem itemFolder = new ToolStripMenuItem("Buka Folder Data", null, delegate {
                if (!string.IsNullOrEmpty(projectRoot) && Directory.Exists(projectRoot))
                {
                    Process.Start("explorer.exe", projectRoot);
                }
            });
            trayMenu.Items.Add(itemFolder);

            trayMenu.Items.Add(new ToolStripSeparator());

            ToolStripMenuItem itemExit = new ToolStripMenuItem("Keluar (Tutup Server)", null, delegate {
                ExitApp();
            });
            trayMenu.Items.Add(itemExit);

            trayIcon = new NotifyIcon();
            trayIcon.Text = "InternBPS - Logbook Magang";
            trayIcon.ContextMenuStrip = trayMenu;

            // Load app icon if exists
            string iconPath = Path.Combine(projectRoot, "launcher", "app.ico");
            if (File.Exists(iconPath))
            {
                try
                {
                    trayIcon.Icon = new Icon(iconPath);
                }
                catch
                {
                    trayIcon.Icon = SystemIcons.Application;
                }
            }
            else
            {
                trayIcon.Icon = SystemIcons.Application;
            }

            trayIcon.Visible = true;
            trayIcon.DoubleClick += delegate {
                OpenAppWindow();
            };
        }

        private static void ExitApp()
        {
            if (trayIcon != null)
            {
                trayIcon.Visible = false;
                trayIcon.Dispose();
                trayIcon = null;
            }

            KillServerProcess();
            Application.Exit();
            Environment.Exit(0);
        }

        private static void KillServerProcess()
        {
            try
            {
                if (serverProcess != null && !serverProcess.HasExited)
                {
                    ProcessStartInfo psi = new ProcessStartInfo();
                    psi.FileName = "taskkill";
                    psi.Arguments = "/PID " + serverProcess.Id + " /T /F";
                    psi.CreateNoWindow = true;
                    psi.UseShellExecute = false;
                    Process.Start(psi);
                    serverProcess = null;
                }
            }
            catch { }
        }

        private static void OnProcessExit(object sender, EventArgs e)
        {
            KillServerProcess();
            if (singleInstanceMutex != null)
            {
                try { singleInstanceMutex.ReleaseMutex(); } catch { }
                singleInstanceMutex = null;
            }
        }
    }
}
