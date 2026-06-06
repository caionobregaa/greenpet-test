export interface IRepository<T> {
    findById(id: string): Promise<T | null>;
    save(entity: T): Promise<void>;
}
//# sourceMappingURL=repository.interface.d.ts.map