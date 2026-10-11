"""Execute the analysis with a fresh kernel using this Python environment."""
from pathlib import Path
import json
import os
import sys
import nbformat
from nbclient import NotebookClient
from jupyter_client import KernelManager
from jupyter_client.kernelspec import KernelSpecManager

root = Path(__file__).resolve().parents[1]
build = root / ".build"
spec = build / "kernels/python3"
spec.mkdir(parents=True, exist_ok=True)
(spec / "kernel.json").write_text(json.dumps({
    "argv": [sys.executable, "-m", "ipykernel_launcher", "-f", "{connection_file}"],
    "display_name": "Python 3", "language": "python",
}))
os.environ["IPYTHONDIR"] = str(build / "ipython")
os.environ["MPLCONFIGDIR"] = str(build / "matplotlib")
manager = KernelManager(kernel_name="python3", kernel_spec_manager=KernelSpecManager(kernel_dirs=[str(spec.parent)]))
path = root / "Lead_Service_Line_Analysis.ipynb"
notebook = nbformat.read(path, as_version=4)
NotebookClient(notebook, km=manager, timeout=180, resources={"metadata": {"path": str(root)}}).execute()
nbformat.write(notebook, path)
errors = [o for c in notebook.cells if c.cell_type == "code" for o in c.get("outputs", []) if o.output_type == "error"]
assert not errors, errors
print(f"Executed {sum(c.cell_type == 'code' for c in notebook.cells)} code cells without errors")
