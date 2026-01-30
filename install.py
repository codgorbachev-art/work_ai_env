import os
import sys
import subprocess
import shutil

def print_step(message):
    print(f"\n[bold green]>>> {message}[/bold green]")

def run_command(command, cwd=None, shell=True):
    try:
        subprocess.check_call(command, cwd=cwd, shell=shell)
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {command}")
        sys.exit(1)

def main():
    print("=======================================")
    print("   Work AI Environment Installer")
    print("=======================================")

    # 1. Check Python Version
    print_step("Checking Python version...")
    if sys.version_info < (3, 10):
        print("Error: Python 3.10 or higher is required.")
        sys.exit(1)
    print(f"Detected Python {sys.version_info.major}.{sys.version_info.minor}")

    # 2. Setup Virtual Environment
    venv_dir = ".venv"
    if not os.path.exists(venv_dir):
        print_step(f"Creating virtual environment in {venv_dir}...")
        run_command(f"{sys.executable} -m venv {venv_dir}")
    else:
        print(f"Virtual environment '{venv_dir}' already exists.")

    # Determine pip path info
    if os.name == 'nt':
        pip_exe = os.path.join(venv_dir, "Scripts", "pip")
        python_exe = os.path.join(venv_dir, "Scripts", "python")
    else:
        pip_exe = os.path.join(venv_dir, "bin", "pip")
        python_exe = os.path.join(venv_dir, "bin", "python")

    # 3. Upgrade Pip and Install Requirements
    print_step("Installing Python dependencies...")
    run_command(f"{python_exe} -m pip install --upgrade pip")
    
    if os.path.exists("requirements.txt"):
        run_command(f"{pip_exe} install -r requirements.txt")
    else:
        print("Warning: requirements.txt not found. Skipping pip install.")

    # 4. Install Node.js dependencies
    voiceflow_dir = "voiceflow"
    if os.path.exists(voiceflow_dir) and os.path.exists(os.path.join(voiceflow_dir, "package.json")):
        print_step("Installing Node.js dependencies for Voiceflow...")
        # Check if npm is available
        if shutil.which("npm"):
            run_command("npm install", cwd=voiceflow_dir)
        else:
            print("Warning: 'npm' not found. Skipping Node.js dependency installation.")

    # 5. Check Credentials
    print_step("Checking configuration...")
    if not os.path.exists("credentials.env"):
        if os.path.exists("credentials.template.env"):
            print("Warning: 'credentials.env' missing.")
            print("Creating 'credentials.env' from template...")
            shutil.copy("credentials.template.env", "credentials.env")
            print("PLEASE EDIT 'credentials.env' AND ADD YOUR API KEYS!")
        else:
             print("Warning: 'credentials.env' and 'credentials.template.env' are missing.")
    else:
        print("'credentials.env' found.")

    print("\n=======================================")
    print("   Installation Complete! 🚀")
    print("=======================================")
    print("To start working:")
    if os.name == 'nt':
        print(f"1. Activate venv:  {venv_dir}\\Scripts\\activate")
    else:
        print(f"1. Activate venv:  source {venv_dir}/bin/activate")
    print("2. Run your scripts.")

if __name__ == "__main__":
    main()
