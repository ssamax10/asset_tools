frappe.pages['asset-label-sheet'].on_page_load = function (wrapper) {
    const page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Asset Label Sheet',
        single_column: true
    });

    $(wrapper).find('.layout-main-section')
        .load('/assets/asset_tools/page/asset_label_sheet/asset_label_sheet.html');

    let allAssets = [];

    $('head').append(`
        <style>
            @page { size: A4; margin: 8mm; }

            .label-grid {
                display: grid;
                grid-template-columns: repeat(3, 60mm);
                gap: 5mm;
            }

            .label {
                width: 60mm;
                height: 25mm;
                border: 1px solid #000;
                padding: 2mm;
                box-sizing: border-box;
                font-family: Arial, sans-serif;
                font-size: 6px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }

            .header {
                display: flex;
                align-items: center;
                gap: 2mm;
                font-weight: bold;
            }

            .header img { max-height: 6mm; }

            .qr { display: flex; justify-content: center; }

            .asset-tag {
                font-weight: bold;
                font-size: 7px;
                text-align: center;
            }

            .footer {
                display: flex;
                justify-content: space-between;
                font-size: 5.5px;
            }

            @media print {
                .toolbar, #asset-list { display: none; }
            }
        </style>
    `);

    const qrScript = document.createElement('script');
    qrScript.src = "https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js";
    document.head.appendChild(qrScript);

    qrScript.onload = () => {
        frappe.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: 'Asset',
                fields: [
                    'name',
                    'location',
                    'custom_calibration_due_date'
                ],
                limit_page_length: 1000
            },
            callback: function (r) {
                if (!r.message) return;
                allAssets = r.message;
                renderAssetList(allAssets);
            }
        });
    };

    function renderAssetList(assets) {
        const list = document.getElementById('asset-list');
        list.innerHTML = '';

        assets.forEach(a => {
            list.insertAdjacentHTML('beforeend', `
                <label>
                  <input type="checkbox" value="${a.name}">
                  ${a.name} (${a.location || '-'})
                </label><br>
            `);
        });
    }

    function renderLabels(assets) {
        const grid = document.getElementById('label-grid');
        grid.innerHTML = '';

        assets.forEach(asset => {
            const url = `${location.origin}/app/asset/${asset.name}`;

            const label = document.createElement('div');
            label.className = 'label';

            label.innerHTML = `
                <div class="header">
                  <img src="/files/company-logo.png">
                  <div>${frappe.defaults.get_default('company')}</div>
                </div>

                <div class="qr"></div>

                <div class="asset-tag">${asset.name}</div>

                <div class="footer">
                  <span>${asset.location || ''}</span>
                  <span>
                    ${asset.custom_calibration_due_date
                      ? 'CAL: ' + frappe.datetime.str_to_user(asset.custom_calibration_due_date)
                      : ''}
                  </span>
                </div>
            `;

            grid.appendChild(label);

            new QRCode(label.querySelector('.qr'), {
                text: url,
                width: 70,
                height: 70,
                correctLevel: QRCode.CorrectLevel.M
            });
        });
    }

    document.getElementById('print-selected').onclick = () => {
        const checked = [...document.querySelectorAll('#asset-list input:checked')]
            .map(i => i.value);

        const selected = allAssets.filter(a => checked.includes(a.name));
        renderLabels(selected);
        setTimeout(() => window.print(), 300);
    };
};
