// Check extension status and update UI
async function updateStatus() {
    const statusEl = document.getElementById('status');

    // Safari web extensions are always "enabled" if installed
    // The status refers to whether the extension is toggled on in Safari
    // We communicate this to the user with instructions
    statusEl.className = 'status status-on';
    statusEl.innerHTML = `
        <p><strong>Extension is installed</strong></p>
        <p style="font-size:10px;margin-top:4px;">To enable: Safari → Settings → Extensions → Check "Reddirect"</p>
    `;
}

document.addEventListener('DOMContentLoaded', updateStatus);
