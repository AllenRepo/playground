using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.Text;
using System.Threading.Tasks;

namespace Wcf.Client1
{
    public class Program
    {
        public static void Main(string[] args)
        {
            ChannelFactory<Wcf.Service1.IContract1> factory = new ChannelFactory<Service1.IContract1>("");
            var client = factory.CreateChannel();

            var result = client.GetModel(1);

            Console.WriteLine(result);
            Console.ReadLine();
        }
    }
}
