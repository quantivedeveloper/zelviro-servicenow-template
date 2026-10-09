import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    bom_json: {
                        table: 'sys_module'
                        id: '7a6c40b39b01471995dc0c40795fa9d4'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: 'a0c87eda458046198186b22b4d654f5c'
                    }
                }
            }
        }
    }
}
