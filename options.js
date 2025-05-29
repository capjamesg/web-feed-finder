document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();
    const prefixUrl = document.querySelector('input[name="prefixUrl"]').value;
    browser.storage.sync.set({ prefixUrl: prefixUrl });
});
// on load, set
function setPrefixUrl() {
    browser.storage.sync.get('prefixUrl').then((result) => {
        if (result.prefixUrl) {
            document.querySelector('input[name="prefixUrl"]').value = result.prefixUrl;
        }
    });
}
document.addEventListener('DOMContentLoaded', setPrefixUrl);