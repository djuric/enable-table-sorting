/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { createHigherOrderComponent } from '@wordpress/compose';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ToggleControl } from '@wordpress/components';
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import './style.scss';

const withEnableTableSorting = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		const { name, attributes, setAttributes } = props;

		if (name !== 'core/table') {
			return <BlockEdit {...props} />;
		}

		return (
			<>
				<BlockEdit key="edit" {...props} />
				<InspectorControls>
					<PanelBody title={__('Sorting', 'enable-table-sorting')} initialOpen={true}>
						<ToggleControl
							label={__('Enable table sorting', 'enable-table-sorting')}
							checked={attributes.isSortable}
							onChange={(value) => {
								setAttributes({ isSortable: value });
							}}
							__nextHasNoMarginBottom
						/>
					</PanelBody>
				</InspectorControls>
			</>
		);
	};
}, 'withEnableTableSorting');

addFilter('editor.BlockEdit', 'enable-table-sorting/enable-table-sorting', withEnableTableSorting);

const registerEnableTableSortingAttribute = (settings, name) => {
	if (name !== 'core/table') {
		return settings;
	}

	return {
		...settings,
		attributes: {
			...settings.attributes,
			isSortable: {
				type: 'boolean',
				default: false
			}
		},
	};
}

addFilter('blocks.registerBlockType', 'enable-table-sorting/enable-table-sorting-attribute', registerEnableTableSortingAttribute);
