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
import java.util.Date;
import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import javax.xml.bind.annotation.XmlRootElement;

/**
 *
 * @author james
 */
@Entity
@Table(name = "analysis", catalog = "phenodcc_embryo", schema = "")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "Analysis.findAll", query = "SELECT a FROM Analysis a"),
    @NamedQuery(name = "Analysis.findById", query = "SELECT a FROM Analysis a WHERE a.id = :id"),
    @NamedQuery(name = "Analysis.findByCid", query = "SELECT a FROM Analysis a WHERE a.cid = :cid"),
    @NamedQuery(name = "Analysis.findByLid", query = "SELECT a FROM Analysis a WHERE a.lid = :lid"),
    @NamedQuery(name = "Analysis.findByGid", query = "SELECT a FROM Analysis a WHERE a.gid = :gid"),
    @NamedQuery(name = "Analysis.findBySid", query = "SELECT a FROM Analysis a WHERE a.sid = :sid"),
    @NamedQuery(name = "Analysis.findByPid", query = "SELECT a FROM Analysis a WHERE a.pid = :pid"),
    @NamedQuery(name = "Analysis.findByQid", query = "SELECT a FROM Analysis a WHERE a.qid = :qid"),
    @NamedQuery(name = "Analysis.findByCidGid", query = "SELECT a FROM Analysis a "
            + "WHERE a.cid = :cid AND a.gid = :gid AND a.statusId = 1 AND a.active = 1"),
    @NamedQuery(name = "Analysis.findByStatusId", query = "SELECT a FROM Analysis a WHERE a.statusId = :statusId"),
    @NamedQuery(name = "Analysis.findByActive", query = "SELECT a FROM Analysis a WHERE a.active = :active"),
    @NamedQuery(name = "Analysis.findByDateAnalysed", query = "SELECT a FROM Analysis a WHERE a.dateAnalysed = :dateAnalysed"),
    @NamedQuery(name = "Analysis.findByPydpiperVersion", query = "SELECT a FROM Analysis a WHERE a.pydpiperVersion = :pydpiperVersion")})
public class Analysis implements Serializable {
    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    private Integer id;
    @Basic(optional = false)
    @NotNull
    @Column(name = "cid")
    private int cid;
    @Basic(optional = false)
    @NotNull
    @Column(name = "lid")
    private int lid;
    @Basic(optional = false)
    @NotNull
    @Column(name = "gid")
    private int gid;
    @Basic(optional = false)
    @NotNull
    @Column(name = "sid")
    private int sid;
    @Basic(optional = false)
    @NotNull
    @Column(name = "pid")
    private int pid;
    @Basic(optional = false)
    @NotNull
    @Column(name = "qid")
    private int qid;
    @Basic(optional = false)
    @NotNull
    @Column(name = "status_id")
    private int statusId;
    @Basic(optional = false)
    @NotNull
    @Column(name = "active")
    private int active;
    @Basic(optional = false)
    @NotNull
    @Column(name = "date_analysed")
    @Temporal(TemporalType.DATE)
    private Date dateAnalysed;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 100)
    @Column(name = "pydpiper_version")
    private String pydpiperVersion;

    public Analysis() {
    }

    public Analysis(Integer id) {
        this.id = id;
    }

    public Analysis(Integer id, int cid, int lid, int gid, int sid, int pid, int qid, int statusId, int active, Date dateAnalysed, String pydpiperVersion) {
        this.id = id;
        this.cid = cid;
        this.lid = lid;
        this.gid = gid;
        this.sid = sid;
        this.pid = pid;
        this.qid = qid;
        this.statusId = statusId;
        this.active = active;
        this.dateAnalysed = dateAnalysed;
        this.pydpiperVersion = pydpiperVersion;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public int getCid() {
        return cid;
    }

    public void setCid(int cid) {
        this.cid = cid;
    }

    public int getLid() {
        return lid;
    }

    public void setLid(int lid) {
        this.lid = lid;
    }

    public int getGid() {
        return gid;
    }

    public void setGid(int gid) {
        this.gid = gid;
    }

    public int getSid() {
        return sid;
    }

    public void setSid(int sid) {
        this.sid = sid;
    }

    public int getPid() {
        return pid;
    }

    public void setPid(int pid) {
        this.pid = pid;
    }

    public int getQid() {
        return qid;
    }

    public void setQid(int qid) {
        this.qid = qid;
    }

    public int getStatusId() {
        return statusId;
    }

    public void setStatusId(int statusId) {
        this.statusId = statusId;
    }

    public int getActive() {
        return active;
    }

    public void setActive(int active) {
        this.active = active;
    }

    public Date getDateAnalysed() {
        return dateAnalysed;
    }

    public void setDateAnalysed(Date dateAnalysed) {
        this.dateAnalysed = dateAnalysed;
    }

    public String getPydpiperVersion() {
        return pydpiperVersion;
    }

    public void setPydpiperVersion(String pydpiperVersion) {
        this.pydpiperVersion = pydpiperVersion;
    }

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (id != null ? id.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof Analysis)) {
            return false;
        }
        Analysis other = (Analysis) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "org.mousephenotype.dcc.embryo.viewer.entities.Analysis[ id=" + id + " ]";
    }
    
}
