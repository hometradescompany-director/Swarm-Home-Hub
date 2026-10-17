# Device inventory receipt boundary

`validateDeviceInventoryReceipt` validates a bounded, scoped metadata receipt only. A receipt must identify its `deviceRef` and `scopeRef`, provide an observation time and truncation state, and list at most 1,000 files with relative paths, byte lengths, optional modification times, and optional SHA-256 digest strings. The validator checks digest shape; it does not read or hash file contents. Unknown receipt and file fields are rejected, so the contract does not carry file contents or permission claims.

This is not Android integration. It requests no Android permissions, does not inspect the device filesystem, scan files, access file contents, transmit data, or connect to a live handoff. The validator cannot establish that metadata is true, that a path exists, that a user granted permission, or that any scope is authorized. A future adapter must implement and separately review those boundaries before using this receipt contract.
