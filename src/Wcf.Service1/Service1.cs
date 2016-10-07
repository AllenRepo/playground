using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ServiceModel;
using System.Runtime.Serialization;

namespace Wcf.Service1
{
    [ServiceContract]
    public interface IContract1
    {
        [OperationContract]
        Model1 GetModel(int id);
    }
    
    [DataContract]
    public class Model1
    {
        [DataMember]
        public string Name { get; set; }
    }

    public class Host1 : IContract1
    {
        public Model1 GetModel(int id)
        {
            return new Model1 { Name = "First : " + id };
        }
    }
}