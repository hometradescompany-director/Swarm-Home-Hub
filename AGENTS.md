# Architecture rules
- Host reachability code only observes the existing transport; production admission, persistence and result delivery remain with the existing Swarm owners, because a health probe must not create a parallel lifecycle or promote authority.
