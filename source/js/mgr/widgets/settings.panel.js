Crosslinks.panel.Settings = function (config) {
    config = config || {};
    Ext.applyIf(config, {
        id: 'crosslinks-panel-settings',
        title: _('crosslinks.settings'),
        items: [{
            html: '<p>' + _('crosslinks.settings_desc') + '</p>',
            border: false,
            cls: 'panel-desc'
        }, {
            xtype: 'crosslinks-grid-system-settings',
            id: 'crosslinks-grid-system-settings',
            cls: 'main-wrapper',
            preventSaveRefresh: true
        }]
    });
    Crosslinks.panel.Settings.superclass.constructor.call(this, config);
};
Ext.extend(Crosslinks.panel.Settings, MODx.Panel);
Ext.reg('crosslinks-panel-settings', Crosslinks.panel.Settings);

Crosslinks.grid.SystemSettings = function (config) {
    config = config || {};
    config.baseParams = {
        action: 'system/settings/getList',
        namespace: 'crosslinks',
        area: MODx.request['area']
    };
    Crosslinks.grid.SystemSettings.superclass.constructor.call(this, config);
};
Ext.extend(Crosslinks.grid.SystemSettings, MODx.grid.SettingsGrid, {
    _showMenu: function (g, ri, e) {
        e.stopEvent();
        e.preventDefault();
        this.menu.record = this.getStore().getAt(ri).data;
        if (!this.getSelectionModel().isSelected(ri)) {
            this.getSelectionModel().selectRow(ri);
        }
        this.menu.removeAll();

        var m = [];
        if (this.menu.record.menu) {
            m = this.menu.record.menu;
        } else {
            m.push({
                text: _('setting_update'),
                handler: this.updateSetting
            });
        }
        if (m.length > 0) {
            this.addContextMenuItem(m);
            this.menu.showAt(e.xy);
        }
    },
    updateSetting: function (btn, e) {
        var r = this.menu.record;
        r.fk = Ext.isDefined(this.config.fk) ? this.config.fk : 0;
        var uss = MODx.load({
            xtype: 'modx-window-setting-update',
            url: Crosslinks.config.connectorUrl,
            action: 'mgr/settings/update',
            record: r,
            grid: this,
            listeners: {
                success: {
                    fn: function () {
                        this.refresh();
                    },
                    scope: this
                }
            }
        });
        uss.reset();
        uss.setValues(r);
        uss.show(e.target);
    },
    clearFilter: function () {
        var ns = 'crosslinks';
        var area = MODx.request['area'] ? MODx.request['area'] : '';

        this.getStore().baseParams = this.initialConfig.baseParams;

        var acb = Ext.getCmp('modx-filter-area');
        if (acb) {
            acb.store.baseParams['namespace'] = ns;
            acb.store.load();
            acb.reset();
        }

        Ext.getCmp('modx-filter-namespace').setValue(ns);
        Ext.getCmp('modx-filter-key').reset();

        this.getStore().baseParams.namespace = ns;
        this.getStore().baseParams.area = area;
        this.getStore().baseParams.key = '';

        this.getBottomToolbar().changePage(1);
    },
    filterByKey: function (tf, newValue, oldValue) {
        this.getStore().baseParams.key = newValue;
        this.getStore().baseParams.namespace = 'crosslinks';
        this.getBottomToolbar().changePage(1);
        return true;
    },
    filterByNamespace: function (cb, rec, ri) {
        this.getStore().baseParams['namespace'] = 'crosslinks';
        this.getStore().baseParams['area'] = '';
        this.getBottomToolbar().changePage(1);

        var acb = Ext.getCmp('modx-filter-area');
        if (acb) {
            var s = acb.store;
            s.baseParams['namespace'] = 'crosslinks';
            s.removeAll();
            s.load();
            acb.setValue('');
        }
    },
    listeners: {
        afterrender: function () {
            this.topToolbar.items.items[0].hide();
            this.topToolbar.items.items[2].hide();
        }
    }
});
Ext.reg('crosslinks-grid-system-settings', Crosslinks.grid.SystemSettings);
