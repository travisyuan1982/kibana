/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import {
  getKibanaTranslationFilesMock,
  initTranslationsMock,
  registerRoutesMock,
} from './i18n_service.test.mocks';

import { BehaviorSubject } from 'rxjs';
import { I18nService } from './i18n_service';

import { configServiceMock } from '../config/mocks';
import { mockCoreContext } from '../core_context.mock';
import { httpServiceMock } from '../http/http_service.mock';

const getConfigService = (locale = 'en') => {
  const configService = configServiceMock.create();
  configService.atPath.mockImplementation((path) => {
    if (path === 'i18n') {
      return new BehaviorSubject({
        locale,
      });
    }
    return new BehaviorSubject({});
  });
  return configService;
};

describe('I18nService', () => {
  let service: I18nService;
  let configService: ReturnType<typeof configServiceMock.create>;
  let http: ReturnType<typeof httpServiceMock.createInternalSetupContract>;

  beforeEach(() => {
    jest.clearAllMocks();
    configService = getConfigService();

    const coreContext = mockCoreContext.create({ configService });
    service = new I18nService(coreContext);

    http = httpServiceMock.createInternalSetupContract();
  });

  describe('#setup', () => {
    it('calls `getKibanaTranslationFiles` with the correct parameters', async () => {
      getKibanaTranslationFilesMock.mockResolvedValue([]);

      const pluginPaths = ['/pathA', '/pathB'];
      await service.setup({ pluginPaths, http });

      expect(getKibanaTranslationFilesMock).toHaveBeenCalledTimes(1);
      expect(getKibanaTranslationFilesMock).toHaveBeenCalledWith('en', pluginPaths);
    });

    it('calls `initTranslations` with the correct parameters', async () => {
      const translationFiles = ['/path/to/file', 'path/to/another/file'];
      getKibanaTranslationFilesMock.mockResolvedValue(translationFiles);

      await service.setup({ pluginPaths: [], http });

      expect(initTranslationsMock).toHaveBeenCalledTimes(1);
      expect(initTranslationsMock).toHaveBeenCalledWith('en', translationFiles);
    });

    it('calls `registerRoutesMock` with the correct parameters', async () => {
      await service.setup({ pluginPaths: [], http });

      expect(registerRoutesMock).toHaveBeenCalledTimes(1);
      expect(registerRoutesMock).toHaveBeenCalledWith({
        locale: 'en',
        router: expect.any(Object),
      });
    });

    it('returns accessors for locale and translation files', async () => {
      const translationFiles = ['/path/to/file', 'path/to/another/file'];
      getKibanaTranslationFilesMock.mockResolvedValue(translationFiles);

      const { getLocale, getTranslationFiles } = await service.setup({ pluginPaths: [], http });

      expect(getLocale()).toEqual('en');
      expect(getTranslationFiles()).toEqual(translationFiles);
    });
  });
});
