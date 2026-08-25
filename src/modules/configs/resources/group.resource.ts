interface GroupRow {
  uuid: string;
  name: string;
  deletedAt: Date | null;
}

export class GroupResource {
  static toObject(group: GroupRow) {
    return { uuid: group.uuid, name: group.name, deletedAt: group.deletedAt };
  }

  static toCollection(groups: GroupRow[]) {
    return groups.map((group) => this.toObject(group));
  }

  static toOption(group: GroupRow) {
    return { uuid: group.uuid, name: group.name };
  }
}
