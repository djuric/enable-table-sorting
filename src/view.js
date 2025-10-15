/**
 * WordPress dependencies
 */
import { store, getContext, getElement } from '@wordpress/interactivity';

store('enable-table-sorting/is-sortable', {
    actions: {
        toggleSort() {
            const context = getContext();

            if (!context.validForSorting) {
                return;
            }

            const fragment = document.createDocumentFragment();

            const { ref: th } = getElement();
            const table = th.closest('table');

            const tbody = table.tBodies[0];
            const rows = Array.from(tbody.rows);
            const type = th.dataset.type;

            const orderCycle = {
                none: 'ascending',
                ascending: 'descending',
                descending: 'none',
            };

            const sort = orderCycle[th.ariaSort];
            th.ariaSort = sort;

            if (sort === 'none') {
                context.originalOrder.forEach(r => fragment.appendChild(r));
                tbody.appendChild(fragment);
                return;
            }

            if (type === 'text') {
                rows.sort((a, b) => {
                    const va = a.cells[th.cellIndex].textContent.trim().toLowerCase();
                    const vb = b.cells[th.cellIndex].textContent.trim().toLowerCase();

                    const res = va.localeCompare(vb);
                    return sort === 'ascending' ? res : -res;
                });
            } else {
                rows.sort((a, b) => {
                    const va = Number(a.cells[th.cellIndex].textContent.trim());
                    const vb = Number(b.cells[th.cellIndex].textContent.trim());

                    return sort === 'ascending' ? va - vb : vb - va;
                });
            }

            rows.forEach(r => fragment.appendChild(r));
            tbody.appendChild(fragment);
        }
    },
    callbacks: {
        setup() {
            const { ref } = getElement();
            const table = ref.querySelector('table');

            if (!table || !table.tHead || table.tBodies.length === 0) {
                return;
            }

            const context = getContext();
            context.validForSorting = true;

            const rows = Array.from(table.tBodies[0].rows);
            const columnTypes = getColumnsDataType(rows);

            context.originalOrder = rows.slice();

            for (const headerCell of table.tHead.rows[0].cells) {
                headerCell.dataset.type = columnTypes[headerCell.cellIndex];
            }
        }
    }
});

const getColumnsDataType = (rows) => {
    const cellsCount = rows[0].cells.length;
    const columnTypes = Array(cellsCount).fill('numeric');

    rows.forEach(row => {
        Array.from(row.cells).forEach((cell, index) => {
            if (columnTypes[index] === 'text') {
                return;
            }

            const value = cell.textContent.trim();
            if (value === '') {
                return;
            }

            if (isNaN(Number(value))) {
                columnTypes[index] = 'text';
            }
        });
    });

    return columnTypes;
}
