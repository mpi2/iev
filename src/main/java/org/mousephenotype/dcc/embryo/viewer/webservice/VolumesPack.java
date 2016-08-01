/*
 * Copyright 2016 Medical Research Council Harwell.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author Neil Horner <n.horner@har.mrc.ac.uk>
 * @author James Brown <james.brown@har.mrc.ac.uk>
 */

package org.mousephenotype.dcc.embryo.viewer.webservice;

import java.util.HashMap;
import java.util.List;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlSeeAlso;
import javax.xml.bind.annotation.XmlType;
import org.mousephenotype.dcc.embryo.viewer.entities.Preprocessed;

@XmlSeeAlso(Preprocessed.class)
@XmlType(propOrder = {"success", "total", "centres"})
public class VolumesPack extends AbstractRestResponse<Preprocessed> {

    @Override
    @XmlElement(name = "centres")
    public HashMap<Integer, List<Preprocessed>> getDataSet() {
        return super.getDataSet();
    }
    
    
}
