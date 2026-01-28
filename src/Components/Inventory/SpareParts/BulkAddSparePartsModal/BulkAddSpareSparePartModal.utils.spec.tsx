import { CSV_PART_TYPES } from '../SpareParts.constants'

import { validateCSVRecords } from './BulkAddSparePartsModal.utils'

describe('bulkSparePartUpload', () => {
  const rackIds = {
    [CSV_PART_TYPES.CONTROLLER]: 'controller_rack_id',
    [CSV_PART_TYPES.HASHBOARD]: 'hashboard_rack_id',
    [CSV_PART_TYPES.PSU]: 'psu_rack_id',
  }

  const validationContext = {
    locations: [
      'workshop.warehouse',
      'workshop.lab',
      'site.warehouse',
      'site.lab',
      'site.container',
      'disposed',
      'vendor',
    ],
    subPartTypes: {
      [CSV_PART_TYPES.CONTROLLER]: new Set([
        'CB4_V10',
        'CB6_V10',
        'CB6_V7',
        'CB6_V5',
        'A113D V1.1',
        'CB Hydro V1.1',
        'CB V1.0',
      ]),
      [CSV_PART_TYPES.PSU]: new Set([
        'P221B',
        'P221C',
        'P463',
        'P663',
        'P564B',
        'P564Y',
        'APW-12/15',
        'APW-17/21',
        'PSU3400-1',
        'PSU3400-3',
      ]),
      [CSV_PART_TYPES.HASHBOARD]: new Set([
        '37x3 KF1960',
        '39x3 KF1960',
        '39X4 KF1950',
        'KF196803C',
        'KF197303C',
        'KF196803C',
        'KF197303C',
        'HB56801 141T',
        'HB56601 246T',
        'HB56601 257T',
        'A3200',
      ]),
    },
  }

  it('should validate correct data', async () => {
    const records = [
      {
        partType: 'controller',
        model: 'CB4_V10',
        parentDeviceModel: 'am',
        serialNum: 'TESTQA1',
        macAddress: '00:1A:2B:3C:4D:5E',
        status: 'ok_brand_new',
        location: 'workshop.warehouse',
        comment: 'c1',
      },
      {
        partType: 'hashboard',
        model: 'KF196803C',
        parentDeviceModel: 'am',
        serialNum: 'TESTQA2',
        macAddress: '',
        status: 'ok_brand_new',
        location: 'workshop.warehouse',
        comment: 'c1',
      },
      {
        partType: 'psu',
        model: 'P221B',
        parentDeviceModel: 'av',
        serialNum: 'TESTQA4',
        macAddress: '',
        status: 'ok_brand_new',
        location: 'workshop.warehouse',
        comment: 'c1',
      },
    ]

    await expect(
      validateCSVRecords(records, validationContext, {
        checkDuplicateDelegate: () => Promise.resolve([]),
        rackIds,
      }),
    ).resolves.toStrictEqual([
      {
        partType: 'controller',
        model: 'CB4_V10',
        parentDeviceModel: 'am',
        serialNum: 'TESTQA1',
        macAddress: '00:1A:2B:3C:4D:5E',
        status: 'ok_brand_new',
        location: 'workshop.warehouse',
        comment: 'c1',
        rackId: rackIds[CSV_PART_TYPES.CONTROLLER],
      },
      {
        partType: 'hashboard',
        model: 'KF196803C',
        parentDeviceModel: 'am',
        serialNum: 'TESTQA2',
        macAddress: '',
        status: 'ok_brand_new',
        location: 'workshop.warehouse',
        comment: 'c1',
        rackId: rackIds[CSV_PART_TYPES.HASHBOARD],
      },
      {
        partType: 'psu',
        model: 'P221B',
        parentDeviceModel: 'av',
        serialNum: 'TESTQA4',
        macAddress: '',
        status: 'ok_brand_new',
        location: 'workshop.warehouse',
        comment: 'c1',
        rackId: rackIds[CSV_PART_TYPES.PSU],
      },
    ])
  })

  it('should invalidate duplicate serial number', async () => {
    const records = [
      {
        partType: 'controller',
        model: 'CB4_V10',
        parentDeviceModel: 'am',
        serialNum: 'TESTQA2',
        macAddress: '00:1A:2B:3C:4D:5E',
        status: 'ok_brand_new',
        location: 'workshop.warehouse',
        comment: 'c1',
      },
      {
        partType: 'controller',
        model: 'CB4_V10',
        parentDeviceModel: 'am',
        serialNum: 'TESTQA2',
        macAddress: '00:1A:2B:3C:4D:5F',
        status: 'ok_brand_new',
        location: 'workshop.warehouse',
        comment: 'c1',
      },
      {
        partType: 'psu',
        model: 'P221B',
        parentDeviceModel: 'av',
        serialNum: 'TESTQA4',
        macAddress: '',
        status: 'ok_brand_new',
        location: 'workshop.warehouse',
        comment: 'c1',
      },
    ]

    await expect(
      validateCSVRecords(records, validationContext, {
        checkDuplicateDelegate: () => Promise.resolve([]),
        rackIds,
      }),
    ).rejects.toThrow(/^Duplicates detected in provided serial numbers$/)
  })

  it('should invalidate duplicate mac address', async () => {
    const records = [
      {
        partType: 'controller',
        model: 'CB4_V10',
        parentDeviceModel: 'am',
        serialNum: 'TESTQA1',
        macAddress: '00:1A:2B:3C:4D:5F',
        status: 'ok_brand_new',
        location: 'workshop.warehouse',
        comment: 'c1',
      },
      {
        partType: 'controller',
        model: 'CB4_V10',
        parentDeviceModel: 'am',
        serialNum: 'TESTQA2',
        macAddress: '00:1A:2B:3C:4D:5F',
        status: 'ok_brand_new',
        location: 'workshop.warehouse',
        comment: 'c1',
      },
      {
        partType: 'psu',
        model: 'P221B',
        parentDeviceModel: 'av',
        serialNum: 'TESTQA4',
        macAddress: '',
        status: 'ok_brand_new',
        location: 'workshop.warehouse',
        comment: 'c1',
      },
    ]

    await expect(
      validateCSVRecords(records, validationContext, {
        checkDuplicateDelegate: () => Promise.resolve([]),
        rackIds,
      }),
    ).rejects.toThrow(/^Duplicates detected in provided mac addresses$/)
  })

  it('should invalidate incorrect location', async () => {
    const records = [
      {
        partType: 'controller',
        model: 'CB4_V10',
        parentDeviceModel: 'am',
        serialNum: 'TESTQA1',
        macAddress: '00:1A:2B:3C:4D:5F',
        status: 'ok_brand_new',
        location: 'UNKNOWN',
        comment: 'c1',
      },
    ]

    await expect(
      validateCSVRecords(records, validationContext, {
        checkDuplicateDelegate: () => Promise.resolve([]),
        rackIds,
      }),
    ).rejects.toThrow(/^\[1\].location/)
  })

  it('should invalidate incorrect status', async () => {
    const records = [
      {
        partType: 'controller',
        model: 'CB4_V10',
        parentDeviceModel: 'am',
        serialNum: 'TESTQA1',
        macAddress: '00:1A:2B:3C:4D:5F',
        status: 'UNKNOWN',
        location: 'workshop.warehouse',
        comment: 'c1',
      },
    ]

    await expect(
      validateCSVRecords(records, validationContext, {
        checkDuplicateDelegate: () => Promise.resolve([]),
        rackIds,
      }),
    ).rejects.toThrow(/^\[1\].status/)
  })

  it('should show correct row number for validation message', async () => {
    const records = [
      {
        partType: 'controller',
        model: 'CB4_V10',
        parentDeviceModel: 'am',
        serialNum: 'TESTQA1',
        macAddress: '00:1A:2B:3C:4D:5E',
        status: 'ok_brand_new',
        location: 'workshop.warehouse',
        comment: 'c1',
      },
      {
        partType: 'controller',
        model: 'CB4_V10',
        parentDeviceModel: 'am',
        serialNum: 'TESTQA2',
        macAddress: '00:1A:2B:3C:4D:5F',
        status: 'ok_brand_new',
        location: 'workshop.warehouse',
        comment: 'c1',
      },
      {
        partType: 'psu',
        model: 'P221B',
        parentDeviceModel: 'av',
        serialNum: 'TESTQA4',
        macAddress: '',
        status: 'unknown',
        location: 'workshop.warehouse',
        comment: 'c1',
      },
    ]

    await expect(
      validateCSVRecords(records, validationContext, {
        checkDuplicateDelegate: () => Promise.resolve([]),
        rackIds,
      }),
    ).rejects.toThrow(/^\[3\].status/)
  })

  it('should invalidate when mac address not provided for controller', async () => {
    const records = [
      {
        partType: 'controller',
        model: 'CB4_V10',
        parentDeviceModel: 'am',
        serialNum: 'TESTQA1',
        status: 'ok_brand_new',
        location: 'workshop.warehouse',
      },
    ]

    await expect(
      validateCSVRecords(records, validationContext, {
        checkDuplicateDelegate: () => Promise.resolve([]),
        rackIds,
      }),
    ).rejects.toThrow(/^\[1\].macAddress/)
  })

  it('should not invalidate when mac address not provided for other than controller', async () => {
    const records = [
      {
        partType: 'psu',
        model: 'P221B',
        parentDeviceModel: 'am',
        serialNum: 'TESTQA1',
        status: 'ok_brand_new',
        location: 'workshop.warehouse',
      },
    ]

    await expect(
      validateCSVRecords(records, validationContext, {
        checkDuplicateDelegate: () => Promise.resolve([]),
        rackIds,
      }),
    ).resolves.toStrictEqual([
      {
        partType: 'psu',
        model: 'P221B',
        parentDeviceModel: 'am',
        serialNum: 'TESTQA1',
        status: 'ok_brand_new',
        location: 'workshop.warehouse',
        rackId: rackIds[CSV_PART_TYPES.PSU],
      },
    ])
  })

  it('should invalidate when serial number is not present', async () => {
    const records = [
      {
        partType: 'psu',
        model: 'P221B',
        parentDeviceModel: 'am',
        status: 'ok_brand_new',
        location: 'workshop.warehouse',
      },
    ]

    await expect(
      validateCSVRecords(records, validationContext, {
        checkDuplicateDelegate: () => Promise.resolve([]),
        rackIds,
      }),
    ).rejects.toThrow(/^\[1\].serialNum/)
  })

  it('should invalidate when incorrect model for controller', async () => {
    const records = [
      {
        partType: 'controller',
        model: 'P221B',
        serialNum: 'TESTQA1',
        macAddress: '00:1A:2B:3C:4D:5F',
        parentDeviceModel: 'am',
        status: 'ok_brand_new',
        location: 'workshop.warehouse',
      },
    ]

    await expect(
      validateCSVRecords(records, validationContext, {
        checkDuplicateDelegate: () => Promise.resolve([]),
        rackIds,
      }),
    ).rejects.toThrow(/^\[1\].model/)
  })

  it('should invalidate when incorrect model for psu', async () => {
    const records = [
      {
        partType: 'psu',
        model: 'random',
        serialNum: 'TESTQA1',
        parentDeviceModel: 'am',
        status: 'ok_brand_new',
        location: 'workshop.warehouse',
      },
    ]

    await expect(
      validateCSVRecords(records, validationContext, {
        checkDuplicateDelegate: () => Promise.resolve([]),
        rackIds,
      }),
    ).rejects.toThrow(/^\[1\].model/)
  })

  it('should invalidate when incorrect model for hashboard', async () => {
    const records = [
      {
        partType: 'hashboard',
        model: 'random',
        serialNum: 'TESTQA1',
        parentDeviceModel: 'am',
        status: 'ok_brand_new',
        location: 'workshop.warehouse',
      },
    ]

    await expect(
      validateCSVRecords(records, validationContext, {
        checkDuplicateDelegate: () => Promise.resolve([]),
        rackIds,
      }),
    ).rejects.toThrow(/^\[1\].model/)
  })

  it('should invalidate when incorrect parent device modal', async () => {
    const records = [
      {
        partType: 'psu',
        model: 'P221B',
        serialNum: 'TESTQA1',
        parentDeviceModel: 'unknown',
        status: 'ok_brand_new',
        location: 'workshop.warehouse',
      },
    ]

    await expect(
      validateCSVRecords(records, validationContext, {
        checkDuplicateDelegate: () => Promise.resolve([]),
        rackIds,
      }),
    ).rejects.toThrow(/^\[1\].parentDeviceModel/)
  })

  it('should invalidate when incorrect part type', async () => {
    const records = [
      {
        partType: 'unknown',
        model: 'P221B',
        serialNum: 'TESTQA1',
        parentDeviceModel: 'unknown',
        status: 'ok_brand_new',
        location: 'workshop.warehouse',
      },
    ]

    await expect(
      validateCSVRecords(records, validationContext, {
        checkDuplicateDelegate: () => Promise.resolve([]),
        rackIds,
      }),
    ).rejects.toThrow(/^\[1\].partType/)
  })

  it('should invalidate when serial number conflicts with existing data', async () => {
    const records = [
      {
        partType: 'psu',
        model: 'P221B',
        serialNum: 'TESTQA1',
        parentDeviceModel: 'am',
        status: 'ok_brand_new',
        location: 'workshop.warehouse',
      },
    ]

    await expect(
      validateCSVRecords(records, validationContext, {
        checkDuplicateDelegate: () => Promise.resolve([true]),
        rackIds,
      }),
    ).rejects.toThrow(/CSV has conflicting serial numbers or MAC addresses with existing data/)
  })
})
