var browser = (typeof browser !== "undefined") ? browser : chrome;

function setPrefixUrl() {
    browser.storage.sync.get('prefixUrl').then((result) => {
        if (result.prefixUrl) {
            document.querySelector('input[name="prefixUrl"]').value = result.prefixUrl;
        }
    });
}

var readers = document.querySelectorAll('a[data-url]');

for (var i = 0; i < readers.length; i++) {
    readers[i].addEventListener('click', function(event) {
        event.preventDefault();
        const url = event.target.getAttribute('data-url');
        document.querySelector('input[name="prefixUrl"]').value = url;
    });
}

document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();
    const prefixUrl = document.querySelector('input[name="prefixUrl"]').value;
    const iconPreference = document.querySelector('#iconPreference').value;
    browser.storage.sync.set({ prefixUrl: prefixUrl, iconPreference: iconPreference });
    document.querySelector('#saved').textContent = 'Saved!';
});

document.addEventListener('DOMContentLoaded', setPrefixUrl);