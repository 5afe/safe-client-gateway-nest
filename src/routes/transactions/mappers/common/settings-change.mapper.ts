import { Injectable } from '@nestjs/common';
import { ModuleTransaction } from '../../../../domain/safe/entities/module-transaction.entity';
import { MultisigTransaction } from '../../../../domain/safe/entities/multisig-transaction.entity';
import { Safe } from '../../../../domain/safe/entities/safe.entity';
import { AddressInfoHelper } from '../../../common/address-info/address-info.helper';
import { NULL_ADDRESS } from '../../../common/constants';
import { AddressInfo } from '../../../common/entities/address-info.entity';
import { AddOwner } from '../../entities/settings-changes/add-owner.entity';
import { ChangeMasterCopy } from '../../entities/settings-changes/change-master-copy.entity';
import { ChangeThreshold } from '../../entities/settings-changes/change-threshold.entity';
import { DeleteGuard } from '../../entities/settings-changes/delete-guard';
import { DisableModule } from '../../entities/settings-changes/disable-module.entity';
import { EnableModule } from '../../entities/settings-changes/enable-module.entity';
import { RemoveOwner } from '../../entities/settings-changes/remove-owner.entity';
import { SetFallbackHandler } from '../../entities/settings-changes/set-fallback-handler.entity';
import { SetGuard } from '../../entities/settings-changes/set-guard.entity';
import { SettingsChange } from '../../entities/settings-changes/settings-change.entity';
import { SwapOwner } from '../../entities/settings-changes/swap-owner.entity';
import { DataDecodedParamHelper } from './data-decoded-param.helper';

@Injectable()
export class SettingsChangeMapper {
  private static readonly SET_FALLBACK_HANDLER = 'setFallbackHandler';
  private static readonly ADD_OWNER_WITH_THRESHOLD = 'addOwnerWithThreshold';
  private static readonly REMOVE_OWNER = 'removeOwner';
  private static readonly SWAP_OWNER = 'swapOwner';
  private static readonly CHANGE_THRESHOLD = 'changeThreshold';
  private static readonly CHANGE_MASTER_COPY = 'changeMasterCopy';
  private static readonly ENABLE_MODULE = 'enableModule';
  private static readonly DISABLE_MODULE = 'disableModule';
  private static readonly SET_GUARD = 'setGuard';

  public static readonly SETTINGS_CHANGE_METHODS = [
    SettingsChangeMapper.SET_FALLBACK_HANDLER,
    SettingsChangeMapper.ADD_OWNER_WITH_THRESHOLD,
    SettingsChangeMapper.REMOVE_OWNER,
    SettingsChangeMapper.SWAP_OWNER,
    SettingsChangeMapper.CHANGE_THRESHOLD,
    SettingsChangeMapper.CHANGE_MASTER_COPY,
    SettingsChangeMapper.ENABLE_MODULE,
    SettingsChangeMapper.DISABLE_MODULE,
    SettingsChangeMapper.SET_GUARD,
  ];

  constructor(
    private readonly addressInfoHelper: AddressInfoHelper,
    private readonly dataDecodedParamHelper: DataDecodedParamHelper,
  ) {}

  async mapSettingsChange(
    chainId: string,
    transaction: MultisigTransaction | ModuleTransaction,
    safe: Safe,
  ): Promise<SettingsChange> {
    const { dataDecoded } = transaction;
    switch (transaction.dataDecoded.method) {
      case SettingsChangeMapper.SET_FALLBACK_HANDLER:
        return new SetFallbackHandler(
          this.dataDecodedParamHelper.getValueAtPosition(dataDecoded, 0),
        );
      case SettingsChangeMapper.ADD_OWNER_WITH_THRESHOLD:
        return new AddOwner(
          new AddressInfo(
            this.dataDecodedParamHelper.getValueAtPosition(dataDecoded, 0),
          ),
          Number(
            this.dataDecodedParamHelper.getValueAtPosition(dataDecoded, 1),
          ),
        );
      case SettingsChangeMapper.REMOVE_OWNER:
        return new RemoveOwner(
          new AddressInfo(
            this.dataDecodedParamHelper.getValueAtPosition(dataDecoded, 1),
          ),
          Number(
            this.dataDecodedParamHelper.getValueAtPosition(dataDecoded, 2),
          ),
        );

      case SettingsChangeMapper.SWAP_OWNER:
        return new SwapOwner(
          new AddressInfo(
            this.dataDecodedParamHelper.getValueAtPosition(dataDecoded, 1),
          ),
          new AddressInfo(
            this.dataDecodedParamHelper.getValueAtPosition(dataDecoded, 2),
          ),
        );
      case SettingsChangeMapper.CHANGE_MASTER_COPY: {
        const masterCopy = await this.addressInfoHelper.getOrDefault(
          chainId,
          safe.address,
        );
        return new ChangeMasterCopy(masterCopy);
      }
      case SettingsChangeMapper.ENABLE_MODULE: {
        const module = await this.addressInfoHelper.getOrDefault(
          chainId,
          this.dataDecodedParamHelper.getValueAtPosition(dataDecoded, 0),
        );
        return new EnableModule(module);
      }
      case SettingsChangeMapper.DISABLE_MODULE: {
        const module = await this.addressInfoHelper.getOrDefault(
          chainId,
          this.dataDecodedParamHelper.getValueAtPosition(dataDecoded, 1),
        );
        return new DisableModule(module);
      }
      case SettingsChangeMapper.CHANGE_THRESHOLD:
        return new ChangeThreshold(
          this.dataDecodedParamHelper.getValueAtPosition(dataDecoded, 0),
        );
      case SettingsChangeMapper.SET_GUARD: {
        const guardValue = this.dataDecodedParamHelper.getValueAtPosition(
          dataDecoded,
          0,
        );
        if (guardValue !== NULL_ADDRESS) {
          const guardAddressInfo = await this.addressInfoHelper.getOrDefault(
            chainId,
            guardValue,
          );
          return new SetGuard(guardAddressInfo);
        } else {
          return new DeleteGuard();
        }
      }
    }
    throw new Error('Unknown setting');
  }
}
