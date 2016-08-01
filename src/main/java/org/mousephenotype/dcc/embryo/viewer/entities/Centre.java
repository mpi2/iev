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

package org.mousephenotype.dcc.embryo.viewer.entities;

import java.io.Serializable;
import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import javax.xml.bind.annotation.XmlRootElement;

/**
 *
 * @author neil
 */
@Entity
@Table(name = "centre", catalog = "phenodcc_overviews", schema = "")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "Centre.getNames", query = "SELECT c FROM Centre c")})

public class Centre implements Serializable {
    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "centre_id")
    private Integer centreId;
    @Size(max = 255)
    @Column(name = "full_name")
    private String fullName;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 20)
    @Column(name = "short_name")
    private String shortName;
    @Size(max = 1024)
    @Column(name = "address")
    private String address;
    @Size(max = 20)
    @Column(name = "telephone_number")
    private String telephoneNumber;
    @Size(max = 255)
    @Column(name = "contact_name")
    private String contactName;
    @Size(max = 255)
    @Column(name = "url")
    private String url;
    @Size(max = 55)
    @Column(name = "imits_name")
    private String imitsName;

    public Centre() {
    }

    public Centre(Integer centreId) {
        this.centreId = centreId;
    }

    public Centre(Integer centreId, String shortName) {
        this.centreId = centreId;
        this.shortName = shortName;
    }

    public Integer getCentreId() {
        return centreId;
    }

    public void setCentreId(Integer centreId) {
        this.centreId = centreId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getShortName() {
        return shortName;
    }

    public void setShortName(String shortName) {
        this.shortName = shortName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getTelephoneNumber() {
        return telephoneNumber;
    }

    public void setTelephoneNumber(String telephoneNumber) {
        this.telephoneNumber = telephoneNumber;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getImitsName() {
        return imitsName;
    }

    public void setImitsName(String imitsName) {
        this.imitsName = imitsName;
    }

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (centreId != null ? centreId.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof Centre)) {
            return false;
        }
        Centre other = (Centre) object;
        if ((this.centreId == null && other.centreId != null) || (this.centreId != null && !this.centreId.equals(other.centreId))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "org.mousephenotype.dcc.embryo.viewer.entities.Centre[ centreId=" + centreId + " ]";
    }
    
}
