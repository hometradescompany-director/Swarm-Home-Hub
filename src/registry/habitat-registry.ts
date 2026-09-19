import type { Habitat } from "../domain/habitat.js";
import type { HabitatId } from "../domain/residence.js";

export interface HabitatRegistry {
  get(id: HabitatId): Promise<Habitat | null>;
  put(habitat: Habitat): Promise<void>;
  list(): Promise<readonly Habitat[]>;
}

export class InMemoryHabitatRegistry implements HabitatRegistry {
  #habitats = new Map<HabitatId, Habitat>();

  async get(id: HabitatId): Promise<Habitat | null> {
    return this.#habitats.get(id) ?? null;
  }

  async put(habitat: Habitat): Promise<void> {
    this.#habitats.set(habitat.id, Object.freeze({ ...habitat }));
  }

  async list(): Promise<readonly Habitat[]> {
    return [...this.#habitats.values()];
  }
}
