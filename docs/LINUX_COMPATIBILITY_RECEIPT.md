# Linux live compatibility receipt

Use this receipt for the physical preflight under [Swarm #502](https://github.com/hometradescompany-director/Swarm-Home-Hub/issues/502). Keep the completed receipt and raw output in a private operator record. Share only the outcome needed for review.

Run from the Swarm checkout as an ordinary user in the approved Linux live session. The collector uses a pre-existing Node.js 22+ runtime and Debian's util-linux `/usr/bin/lsblk`. Verify the official live image checksum and record recovery media and backup readiness separately before considering an install target. Use the live session without mounting or changing the installed system.

```bash
node scripts/linux-compatibility-receipt.mjs
```

The script prints `SwarmLinuxCompatibilityReceipt/v1` JSON to stdout. To save it, redirect stdout to an explicitly selected private location. The collector reads the reported architecture and RAM total, sums top-level block devices reported as disks and records the versions of its own runtime and `lsblk`. The disk total can include the boot USB or other attached drives and can reflect a virtual device. Verify the internal disk and available capacity separately without mounting it. The collector queries only block type and size and discards raw command errors.

Exit `0` means the automated fields were measured for the current host. Exit `1` preserves the partial receipt with typed `unknown` fields. Exit `2` indicates invalid invocation. Every physical or operator check starts as `unmeasured`. A CI or VM result describes that environment only.

## Private operator template

Copy this blank table into your private record. Use an operator role or non-identifying alias, UTC date and a short factual result. Avoid serial numbers, account names, hostnames, IP or MAC addresses, filesystem paths, credentials and raw hardware or network logs.

| Field | Result |
| --- | --- |
| Operator reference and observation time in UTC | Unmeasured |
| Intended device visually verified by operator | Unmeasured |
| Official live image release, architecture and published SHA-256 | Unmeasured |
| Downloaded image checksum comparison | Unmeasured |
| Recovery media and backup readiness | Unmeasured |
| Collector source commit and local JSON receipt reference | Unmeasured |
| CPU model and internal disk capacity/available space, if safely observable | Unmeasured |
| Display and graphics | Unmeasured |
| Touchscreen | Unmeasured |
| Keyboard | Unmeasured |
| Wi-Fi | Unmeasured |
| Suspend/resume | Unmeasured |
| Charging | Unmeasured |
| Bounded sustained-load thermal behaviour, with duration | Unmeasured |
| Reboot survival | Unmeasured |
| Persistence/durability | Unmeasured |

Record physical checks as pass, fail or unmeasured with the observation that supports each result. Keep failed and unmeasured checks visible when reporting compatibility. Assess any install target after this preflight and separate authorization. Reboot survival and durability require later on-device verification.

This receipt records compatibility evidence for an operator. Atlas admission, installed service readiness, live federation and durable state each require their own proof. Swarm's phone [file metadata receipt](DEVICE_INVENTORY_RECEIPT.md) has a separate scope.
